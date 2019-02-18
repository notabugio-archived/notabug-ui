import * as R from "ramda";
import { query, all } from "gun-scope";
import { oracle } from "gun-cleric";
import { basic } from "gun-cleric-scope";
import { routes } from "../notabug-peer/json-schema";
import { multiThingData } from "../queries";
import { COMMAND_RE } from "../notabug-peer/constants";
import { PREFIX } from "../notabug-peer";

const tokenizeCommand = R.compose(
  R.map(R.trim),
  R.split(" "),
  R.replace(COMMAND_RE, ""),
  R.propOr("", 0),
  R.split("\n")
);

const mapCommands = thingData =>
  R.reduce(
    (cmdMap, id) => {
      const body = R.path([id, "body"], thingData);
      const authorId = R.path([id, "authorId"], thingData) || "anon";
      const timestamp = parseFloat(R.path([id, "timestamp"], thingData));
      if (!R.test(COMMAND_RE, body)) return cmdMap;
      const tokenized = [authorId, ...tokenizeCommand(body), id];
      return R.assocPath(tokenized, timestamp || 0, cmdMap);
    },
    {},
    R.keys(thingData)
  );

const tabulatorQuery = query(async (scope, route) => {
  const thingSoul = routes.Thing.reverse(route.match);
  const [up, down, comment, replySouls] = await all([
    scope.get(`${thingSoul}/votesup`).count(),
    scope.get(`${thingSoul}/votesdown`).count(),
    scope.get(`${thingSoul}/allcomments`).count(),
    scope.get(`${thingSoul}/comments`).souls()
  ]);
  const thingIds = R.map(
    R.compose(
      R.prop("thingId"),
      routes.Thing.match.bind(routes.Thing)
    ),
    replySouls
  );
  const thingData = await multiThingData(scope, { thingIds });
  const commandMap = mapCommands(thingData);
  const result = {
    up,
    down,
    comment,
    replies: replySouls.length,
    score: up - down
  };

  if (R.keys(commandMap).length) result.commands = JSON.stringify(commandMap);
  return result;
});

export default oracle({
  name: "tabulator",
  routes: [
    basic({
      path: `${PREFIX}/things/:thingId/votecounts@~:tab1.:tab2.`,
      priority: 10,
      throttleGet: 1000 * 60 * 60 * 4,
      checkMatch: ({ thingId }) => !!thingId,
      query: tabulatorQuery
    })
  ]
});
