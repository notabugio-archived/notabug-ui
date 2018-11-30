import * as SOULS from "../notabug-peer/souls";
import { PREFIX } from "../notabug-peer";
import { query, all } from "../notabug-peer/scope";
import { oracle, basicQueryRoute } from "./oracle";

export default oracle({
  name: "tabulator",
  routes: [
    basicQueryRoute({
      path: `${PREFIX}/things/:thingid/votecounts@~:tab1.:tab2.`,
      priority: 10,
      checkMatch: ({ thingid }) => !!thingid,
      query: query((scope, route) => {
        const thingSoul = SOULS.thing.soul(route.match);
        return all([
          scope.get(`${thingSoul}/votesup`).count(),
          scope.get(`${thingSoul}/votesdown`).count(),
          scope.get(`${thingSoul}/allcomments`).count()
        ]).then(([up, down, comment]) => ({ up, down, comment, score: up - down }));
      })
    })
  ]
});
