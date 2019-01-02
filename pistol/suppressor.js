const {
  compose,
  keys,
  assoc,
  assocPath,
  prop,
  path,
  without
} = require("ramda");
const Route = require("route-parser");
const RouteRegexpVisitor = require("route-parser/lib/route/visitors/regexp");
const Ajv = require("ajv");

const refRoute = new Route("#/definitions/:refName");

function routeToRegexStr(route) {
  const { re } = RouteRegexpVisitor.visit(route.ast);
  const reStr = re.toString();
  return reStr.slice(1, reStr.length - 1);
}

const PERMISSIVE_SCHEMA = {
  Node: {
    title: "Gun Node",
    description: "Any node supported by gun",
    $async: true,
    additionalProperties: {
      anyOf: [
        { $ref: "#/definitions/GunNodeMeta" },
        { $ref: "#/definitions/GunEdge" },
        { type: "null" },
        { type: "string" },
        { type: "number" },
        { type: "boolean" }
      ]
    },
    soul: {
      pattern: "*soul",
      properties: {
        soul: { type: "string" }
      },
      required: ["soul"]
    }
  }
};

const DEFAULT_SCHEMA = PERMISSIVE_SCHEMA;

const initAjv = ({ coerceTypes = true, removeAdditional = false } = {}) => {
  const ajv = new Ajv({ coerceTypes, removeAdditional });
  ajv.addKeyword("soul", { compile: compileValidateSoul(ajv) });
  ajv.addKeyword("edgeMatchesKey", { compile: compileEdgeMatchesKey(ajv) });
  ajv.addKeyword("propsFromSoul", { compile: compilePropsFromSoul });
  return ajv;
};

function createSuppressor({
  initAjv = initAjv,
  id = "http://example.com/schemas/gun-schema.json",
  jsonSchema = "http://json-schema.org/draft-07/schema#",
  title = "Gun Message Schema",
  description = "A defintion for the gunDB wire protocol",
  definitions: supplied = DEFAULT_SCHEMA
} = {}) {
  const nodeTypes = [];
  const definitions = keys(supplied).reduce((defs, typeName) => {
    const { pattern, ...soulSchema } = path([typeName, "soul"], defs) || {};
    if (!pattern) return defs;
    const route = new Route(pattern);
    const pathOrRef = p => {
      const val = path(p, defs);
      const ref = prop("$refs", val);
      const refName = prop("refName", refRoute.match(ref || ""));
      return refName ? prop(refName, defs) : val;
    };
    nodeTypes.push(typeName);
    return compose(
      assocPath([typeName, "$async"], true),
      assoc(`${typeName}Soul`, {
        type: "string",
        pattern: routeToRegexStr(route)
      }),
      assoc(`${typeName}Edge`, {
        type: "object",
        additionalProperties: false,
        properties: {
          "#": { $ref: `#/definitions/${typeName}Soul` }
        },
        required: ["#"]
      }),
      assocPath(
        [typeName, "required"],
        [...(path([typeName, "required"], defs) || []), "_"]
      ),
      assocPath([typeName, "properties", "_"], {
        type: "object",
        allOf: [{ $ref: "#/definitions/GunNodeMeta" }],
        properties: {
          "#": { $ref: `#/definitions/${typeName}Soul` },
          ">": {
            type: "object",
            properties: keys(pathOrRef([typeName, "properties"])).reduce(
              (props, key) => assoc(key, { type: "number" }, props),
              {}
            ),
            patternProperties: keys(
              pathOrRef([typeName, "patternProperties"])
            ).reduce((props, key) => assoc(key, { type: "number" }, props), {})
          }
        }
      })
    )(defs);
  }, supplied);

  const schema = {
    $id: id,
    $schema: jsonSchema,
    $async: true,
    title,
    description,
    anyOf: [{ $ref: "#/definitions/GunMsg" }],
    definitions: {
      GunMsg: {
        $async: true,
        type: "object",
        required: ["#"],
        additionalProperties: false,
        properties: {
          "#": {
            title: "Message Identifier",
            description: "This should be a globally unique identifier",
            type: "string"
          },
          "##": {
            title: "Fast Hash Value?",
            description: "I have no idea how this is calculated",
            type: "number"
          },
          "@": {
            title: "Responding To",
            description: "The message identifier this message is responding to",
            type: "string"
          },
          "><": {
            title: "Adjacent Peers",
            description: "Not really sure how this works",
            type: "string"
          },
          how: {
            title: "Used for debugging",
            description: "Shouldn't actually be sent over wire (but it is)",
            type: "string"
          },
          err: {
            anyOf: [{ type: "null" }, { type: "string" }]
          },
          leech: {
            title: "Leech Command",
            description: "Gun protocol extension added by pistol",
            type: "boolean"
          },
          get: {
            title: "Get Command",
            description: "A request for graph data",
            type: "object",
            additionalProperties: false,
            required: ["#"],
            properties: {
              "#": {
                description: "The soul to request data for",
                anyOf: nodeTypes.map(name => ({
                  $ref: `#/definitions/${name}Soul`
                }))
              },
              ".": {
                description: "Request a single property?",
                type: "string"
              }
            }
          },
          put: {
            $async: true,
            title: "Put Command",
            description: "A payload of graph data",
            type: "object",
            additionalProperties: {
              anyOf: nodeTypes.map(name => ({
                $ref: `#/definitions/${name}`
              }))
            }
          }
        }
      },
      GunChangeStates: {
        type: "object",
        title: "Gun Change States",
        description: "A map of property names to update timestamps",
        patternProperties: {
          ".*": {
            type: "number"
          }
        }
      },
      GunNodeMeta: {
        title: "Gun Node Metadata",
        description: "Change State and soul of a gun node",
        type: "object",
        additionalProperties: false,
        properties: {
          "#": { title: "Soul", type: "string" },
          ">": { $ref: "#/definitions/GunChangeStates" }
        },
        required: ["#", ">"]
      },
      GunEdge: {
        type: "object",
        additionalProperties: false,
        properties: {
          "#": { type: "string" }
        },
        required: ["#"]
      },
      ...definitions
    }
  };
  const ajv = initAjv();
  ajv.addSchema({
    $id: "schema.json",
    definitions: schema.definitions
  });
  return { schema, validate: ajv.compile(schema) };
}

const compileValidateSoul = ajv => (schema, parentSchema) => {
  const { pattern, ...matchSchema } = schema || {};
  const route = pattern && new Route(pattern);
  return (data, _cPath, _parentData, keyInParent) => {
    const soul = path(["_", "#"], data);
    if (!soul || !pattern || soul !== keyInParent) return false;
    const match = route.match(soul);
    return match ? ajv.compile(matchSchema)(match) : false;
  };
};

const compilePropsFromSoul = (propMap, parentSchema) => {
  const pattern = path(["soul", "pattern"], parentSchema);
  const route = pattern && new Route(pattern);
  return data => {
    const soul = path(["_", "#"], data);
    const soulProps = route.match(soul) || {};
    return !keys(propMap).find(propName => {
      if (!(propName in data)) return false;
      return prop(propName, soulProps) !== prop(prop(propName, propMap), data);
    });
  };
};

const compileEdgeMatchesKey = ajv => schema => (
  data,
  _cPath,
  _parentData,
  keyInParent
) => (schema ? prop("#", data) === keyInParent : true);

module.exports = { PERMISSIVE_SCHEMA, initAjv, createSuppressor };
