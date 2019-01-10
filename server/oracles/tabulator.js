import { routes } from "../notabug-peer/json-schema";
import { PREFIX } from "../notabug-peer";
import { query, all } from "../notabug-peer/scope";
import { oracle, basicQueryRoute } from "./oracle";

export default oracle({
  name: "tabulator",
  routes: [
    basicQueryRoute({
      path: `${PREFIX}/things/:thingId/votecounts@~:tab1.:tab2.`,
      priority: 10,
      checkMatch: ({ thingId }) => !!thingId,
      query: query((scope, route) => {
        const thingSoul = routes.Thing.reverse(route.match);
        return all([
          scope.get(`${thingSoul}/votesup`).count(),
          scope.get(`${thingSoul}/votesdown`).count(),
          scope.get(`${thingSoul}/allcomments`).count()
        ]).then(([up, down, comment]) => ({ up, down, comment, score: up - down }));
      })
    })
  ]
});
