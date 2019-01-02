const { compose, assoc, path, prop, keys, without } = require("ramda");
const Route = require("route-parser");
const objHash = require("object-hash");
const { createSuppressor } = require("./suppressor");
const sea = require("./sear");
const argon2 = require("argon2");

const PREFIX = "nab";
const MAX_HASH_SIZE = 64;
const MAX_POW_NONCE_SIZE = 64;
const MAX_TOPIC_SIZE = 42;
const MAX_AUTHOR_ALIAS_SIZE = 256;
const MAX_AUTHOR_ID_SIZE = 128; // ???
const MAX_URL_SIZE = 2048;
const MAX_DOMAIN_SIZE = 256;
const MAX_THING_KIND_SIZE = 16;
const MAX_THING_TITLE_SIZE = 300;
const MAX_THING_BODY_SIZE = 50000;

const MAX_LISTING_IDS_SIZE = 50000;
const MAX_LISTING_SOURCE_SIZE = 50000;
const MAX_LISTING_TABS_SIZE = 5000;

const thingRegex = `^${PREFIX}/things/`;

const definitions = {
  ...sea.AUTH_SCHEMA,
  topicName: {
    type: "string",
    minLength: 1,
    maxLength: MAX_TOPIC_SIZE
  },

  TopicDay: {
    title: "Topic Day",
    description: "A single day of things in a topic",
    soul: {
      pattern: `${PREFIX}/topics/:topicName/days/:year/:month/:day`,
      properties: {
        topicName: { $ref: "schema.json#/definitions/topicName" },
        year: { type: "number", minimum: 2018, maximum: 2100 },
        month: { type: "number", minimum: 1, maximum: 12 },
        day: { type: "number", minimum: 1, maximum: 31 }
      },
      required: ["topicName", "year", "month", "day"]
    },
    propsFromSoul: { name: "topicName" },
    properties: {
      name: {
        description: "Deprecated as unnecessary",
        type: "string"
      }
    },
    additionalProperties: {
      edgeMatchesKey: true,
      anyOf: [
        { $ref: "#/definitions/ThingEdge" },
        { $ref: "#/definitions/TopicEdge" }
      ]
    }
  },

  Topic: {
    title: "Topic",
    description: "All things in a topic",
    soul: {
      pattern: `${PREFIX}/topics/:topicName`,
      properties: {
        topicName: { $ref: "schema.json#/definitions/topicName" }
      },
      required: ["topicName"]
    },
    propsFromSoul: { name: "topicName" },
    properties: {
      name: {
        description: "Deprecated as unnecessary",
        type: "string"
      }
    },
    additionalProperties: {
      edgeMatchesKey: true,
      anyOf: [
        { $ref: "#/definitions/ThingEdge" },
        { $ref: "#/definitions/TopicEdge" }
      ]
    }
  },

  domainName: {
    type: "string",
    minLength: 1,
    maxLength: MAX_DOMAIN_SIZE
  },

  Domain: {
    title: "Domain",
    description: "All things in a domain",
    soul: {
      pattern: `${PREFIX}/domains/:domainName`,
      properties: {
        domainName: { $ref: "schema.json#/definitions/domainName" }
      },
      required: ["domainName"]
    },
    additionalProperties: {
      edgeMatchesKey: true,
      anyOf: [{ $ref: "#/definitions/ThingEdge" }]
    }
  },

  url: { type: ["null", "string"] },
  URL: {
    title: "URL",
    description: "All things for a given URL",
    soul: {
      pattern: `${PREFIX}/urls/\*url`,
      properties: {
        url: { $ref: "schema.json#/definitions/url" }
      },
      required: ["url"]
    },
    additionalProperties: {
      edgeMatchesKey: true,
      anyOf: [{ $ref: "#/definitions/ThingEdge" }]
    }
  },

  thingId: {
    type: "string",
    maxLength: MAX_HASH_SIZE
  },

  thingSoul: {
    properties: {
      thingId: { "#ref": "#definitions/thingId" }
    }
  },

  ThingAllComments: {
    title: "Thing All Comments",
    description: "All comments for a given submission",
    soul: {
      pattern: `${PREFIX}/things/:thingId/allcomments`,
      allOf: [{ $ref: "schema.json#/definitions/thingSoul" }]
    },
    additionalProperties: {
      edgeMatchesKey: true,
      anyOf: [{ $ref: "#/definitions/ThingEdge" }]
    }
  },

  ThingComments: {
    title: "Thing Comments",
    description: "Direct replies to a thing",
    soul: {
      pattern: `${PREFIX}/things/:thingId/comments`,
      allOf: [{ $ref: "schema.json#/definitions/thingSoul" }]
    },
    additionalProperties: {
      edgeMatchesKey: true,
      anyOf: [{ $ref: "#/definitions/ThingEdge" }]
    }
  },

  timestamp: { type: ["number", "string"] },
  thingKind: {
    type: "string",
    maxLength: MAX_THING_KIND_SIZE
  },

  Thing: {
    title: "Thing Reference",
    description:
      "These are submissions, comments, chat messages and wiki pages",
    soul: {
      pattern: `${PREFIX}/things/:thingId`,
      allOf: [{ $ref: "schema.json#/definitions/thingSoul" }]
    },
    propsFromSoul: { id: "thingId" },
    properties: {
      id: { $ref: "#/definitions/thingId" },
      kind: { "#ref": "#/definitions/thingKind" },
      timestamp: { $ref: "#/definitions/timestamp" },
      originalHash: { $ref: "#/definitions/thingId" },
      data: {
        oneOf: [
          { $ref: "#/definitions/ThingDataEdge" },
          { $ref: "#/definitions/ThingDataSignedEdge" }
        ]
      },
      topic: {
        anyOf: [
          { $ref: "#/definitions/TopicEdge" },
          {
            description: "Some old things had generic topic souls",
            type: "object",
            additionalProperties: false,
            properties: {
              "#": { type: "string", maxLength: 42 }
            },
            required: ["#"]
          }
        ]
      },
      domain: { $ref: "#/definitions/DomainEdge" },
      url: { $ref: "#/definitions/URLEdge" },
      comments: { thingRelatedEdge: "ThingComments" },
      allcomments: { thingRelatedEdge: "ThingAllComments" },
      votesup: { thingRelatedEdge: "ThingVotesUp" },
      votesdown: { thingRelatedEdge: "ThingVotesDown" },
      op: { $ref: "#/definitions/ThingEdge" },
      replyTo: { $ref: "#/definitions/ThingEdge" },
      author: { $ref: "#/definitions/SEAAuthorEdge" }
    },

    anyOf: [
      {
        allOf: [
          {
            thingHashMatchesSoul: true
          },
          {
            anyOf: [
              { signedThingDataMatchesThing: true },
              { thingDataMatchesOriginalHash: true }
            ]
          }
        ]
      },
      { isLegacyThing: true },
      {
        additionalProperties: false,
        description: "Self verifying can be updated in isolation",
        properties: {
          comments: { thingRelatedEdge: "ThingComments" },
          allcomments: { thingRelatedEdge: "ThingAllComments" },
          votesup: { thingRelatedEdge: "ThingVotesUp" },
          votesdown: { thingRelatedEdge: "ThingVotesDown" }
        }
      }
    ]
  },

  ProofOfWorkVotes: {
    $async: true,
    keysAreProofsOfWork: {
      algorithm: "argon2d",
      config: {
        complexity: 6,
        hashLength: 32,
        timeCost: 1,
        memoryCost: 10240,
        parallelism: 1
      }
    }
  },

  ThingVotesUp: {
    soul: {
      pattern: `${PREFIX}/things/:thingId/votesup`,
      allOf: [{ $ref: "schema.json#/definitions/thingSoul" }]
    },
    allOf: [{ $ref: "#/definitions/ProofOfWorkVotes" }]
  },

  ThingVotesDown: {
    soul: {
      pattern: `${PREFIX}/things/:thingId/votesdown`,
      allOf: [{ $ref: "schema.json#/definitions/thingSoul" }]
    },
    allOf: [{ $ref: "#/definitions/ProofOfWorkVotes" }]
  },

  ThingData: {
    title: "Unsigned Thing Data",
    description: "This is the actual content of a thing",
    soul: {
      pattern: `${PREFIX}/things/:thingId/data`,
      allOf: [{ $ref: "schema.json#/definitions/thingSoul" }],
      required: ["thingId"]
    },
    properties: {
      kind: { $ref: "#/definitions/thingKind" },
      title: {
        type: "string",
        minLength: 1,
        maxLength: MAX_THING_TITLE_SIZE
      },
      topic: { $ref: "#/definitions/topicName" },
      body: { type: ["null", "string"], maxLength: MAX_THING_BODY_SIZE },
      author: { $ref: "#/definitions/seaAlias" },
      authorId: { $ref: "#/definitions/seaAuthorId" },
      opId: { $ref: "#/definitions/thingId" },
      replyToId: { $ref: "#/definitions/thingId" },
      domain: { $ref: "#/definitions/domainName" },
      url: { $ref: "#/definitions/url" },
      timestamp: { $ref: "#/definitions/timestamp" }
    },
    thingDataHashMatchesSoul: true
  },

  ThingDataSigned: {
    title: "Signed Thing Data",
    description:
      "This is the actual content of a thing, cryptographically signed",
    soul: {
      pattern: `${PREFIX}/things/:thingId/data~:authorId.`,
      properties: {
        thingId: { $ref: "schema.json#/definitions/thingId" },
        authorId: { $ref: "schema.json#/definitions/seaAuthorId" }
      },
      required: ["thingId", "authorId"]
    },
    properties: {
      kind: { sea: { $ref: "schema.json#/definitions/thingKind" } },
      title: {
        sea: {
          type: "string",
          minLength: 1,
          maxLength: MAX_THING_TITLE_SIZE
        }
      },
      topic: { sea: { $ref: "schema.json#/definitions/topicName" } },
      body: {
        sea: { type: ["null", "string"], maxLength: MAX_THING_BODY_SIZE }
      },
      author: {
        sea: { $ref: "schema.json#/definitions/seaAlias" }
      },
      authorId: { sea: { $ref: "schema.json#/definitions/seaAuthorId" } },
      opId: { sea: { $ref: "schema.json#/definitions/thingId" } },
      replyToId: { sea: { $ref: "schema.json#/definitions/thingId" } },
      domain: { sea: { $ref: "schema.json#/definitions/domainName" } },
      url: { sea: { $ref: "schema.json#/definitions/url" } },
      timestamp: { sea: { $ref: "schema.json#/definitions/timestamp" } }
    }
  },

  ThingVoteCounts: {
    title: "Thing Vote Counts",
    description: "Aggregated counts from a tabulator",
    soul: {
      pattern: `${PREFIX}/things/:thingId/votecounts@~:tabulatorId.`,
      properties: {
        thingId: { $ref: "schema.json#/definitions/thingId" },
        tabulatorId: { $ref: "schema.json#/definitions/seaAuthorId" }
      }
    },
    properties: {
      up: { sea: { type: ["number", "string"] } },
      down: { sea: { type: ["number", "string"] } },
      comment: { sea: { type: ["number", "string"] } },
      score: { sea: { type: ["number", "string"] } }
    }
  },

  ListingData: {
    $async: true,
    title: "Listing Node Data",
    description: "Shared description of listing properties",
    type: "object",
    properties: {
      ids: { sea: { type: "string", maxLength: MAX_LISTING_IDS_SIZE } },
      source: {
        sea: { type: "string", maxLength: MAX_LISTING_SOURCE_SIZE }
      },

      // XXX: rest are deprecated in favor of source
      name: { sea: { type: ["string", "null"], maxLength: MAX_TOPIC_SIZE } },
      submitTopic: {
        sea: { type: "string", maxLength: MAX_TOPIC_SIZE }
      },
      tabs: {
        sea: { type: "string", maxLength: MAX_LISTING_TABS_SIZE }
      },
      curators: {
        sea: { type: "string", maxLength: MAX_LISTING_SOURCE_SIZE }
      },
      censors: {
        sea: { type: "string", maxLength: MAX_LISTING_SOURCE_SIZE }
      },
      userId: { sea: { $ref: "schema.json#/definitions/seaAuthorId" } },
      opId: { sea: { $ref: "schema.json#/definitions/thingId" } },
      isChat: { sea: { type: ["boolean", "string"] } }
    }
  },

  sortName: {
    type: "string",
    enum: [
      "new",
      "old",
      "active",
      "top",
      "comments",
      "discussed",
      "hot",
      "best",
      "controversial",
      "random"
    ]
  },

  TopicListing: {
    soul: {
      pattern: `${PREFIX}/t/:topic/:sort@~:indexer.`,
      properties: {
        topic: { $ref: "schema.json#/definitions/topicName" },
        sort: { $ref: "schema.json#/definitions/sortName" },
        indexer: { $ref: "schema.json#/definitions/seaAuthorId" }
      }
    },
    allOf: [{ $ref: "#/definitions/ListingData" }]
  },

  DomainListing: {
    soul: {
      pattern: `${PREFIX}/domain/:domain/:sort@~:indexer.`,
      properties: {
        domain: { $ref: "schema.json#/definitions/domainName" },
        sort: { $ref: "schema.json#/definitions/sortName" },
        indexer: { $ref: "schema.json#/definitions/seaAuthorId" }
      }
    },
    allOf: [{ $ref: "#/definitions/ListingData" }]
  },

  ThingCommentsListing: {
    soul: {
      pattern: `${PREFIX}/things/:thingId/comments/:sort@~:indexer.`,
      properties: {
        thingId: { $ref: "schema.json#/definitions/thingId" },
        sort: { $ref: "schema.json#/definitions/sortName" },
        indexer: { $ref: "schema.json#/definitions/seaAuthorId" }
      }
    },
    allOf: [{ $ref: "#/definitions/ListingData" }]
  },

  userListingType: {
    type: "string",
    enum: ["overview", "submitted", "comments"]
  },

  AuthorRepliesListing: {
    soul: {
      pattern: `${PREFIX}/user/:authorId/replies/:type/:sort@~:indexer.`,
      properties: {
        authorId: { $ref: "schema.json#/definitions/seaAuthorId" },
        sort: { $ref: "schema.json#/definitions/sortName" },
        indexer: { $ref: "schema.json#/definitions/seaAuthorId" },
        type: { $ref: "schema.json#/definitions/userListingType" }
      }
    },
    allOf: [{ $ref: "#/definitions/ListingData" }]
  },

  AuthorProfileListing: {
    soul: {
      pattern: `${PREFIX}/user/:authorId/:type/:sort@~:indexer.`,
      properties: {
        authorId: { $ref: "schema.json#/definitions/seaAuthorId" },
        sort: { $ref: "schema.json#/definitions/sortName" },
        indexer: { $ref: "schema.json#/definitions/seaAuthorId" },
        type: { $ref: "schema.json#/definitions/userListingType" }
      }
    },
    allOf: [{ $ref: "#/definitions/ListingData" }]
  },

  SpaceListing: {
    soul: {
      pattern: `${PREFIX}/user/:authorId/spaces/:name/:sort@~:indexer.`,
      properties: {
        authorId: { $ref: "schema.json#/definitions/seaAuthorId" },
        sort: { $ref: "schema.json#/definitions/sortName" },
        indexer: { $ref: "schema.json#/definitions/seaAuthorId" },
        name: { $ref: "schema.json#/definitions/topicName" }
      }
    },
    allOf: [{ $ref: "#/definitions/ListingData" }]
  },

  AuthorComments: {
    title: "Author's Comments",
    description: "All of an authors comments should be linked here",
    soul: {
      pattern: `${PREFIX}/comments~:authorId.`,
      properties: {
        authorId: { $ref: "schema.json#/definitions/seaAuthorId" }
      },
      required: ["authorId"]
    },
    additionalProperties: {
      sea: {
        edgeMatchesKey: true,
        anyOf: [{ $ref: "schema.json#/definitions/ThingEdge" }]
      }
    }
  },

  AuthorSubmissions: {
    title: "Author's Submissions",
    description: "All of an author's submissions should be linked here",
    soul: {
      pattern: `${PREFIX}/submissions~:authorId.`,
      properties: {
        authorId: { $ref: "schema.json#/definitions/seaAuthorId" }
      },
      required: ["authorId"]
    }
  },

  AuthorThings: {
    title: "Author's Things",
    description: "All of an author's things should be linked here",
    soul: {
      pattern: `${PREFIX}/things~:authorId.`,
      properties: {
        authorId: { $ref: "schema.json#/definitions/seaAuthorId" }
      },
      required: ["authorId"]
    },
    additionalProperties: {
      sea: {
        edgeMatchesKey: true,
        anyOf: [{ $ref: "schema.json#/definitions/ThingEdge" }]
      }
    }
  },

  AuthorPages: {
    title: "Author Page Map",
    description: "Mapping of page names to things",
    soul: {
      pattern: `${PREFIX}/pages~:authorId.`,
      properties: {
        authorId: { $ref: "schema.json#/definitions/seaAuthorId" }
      },
      required: ["authorId"]
    },
    additionalProperties: {
      sea: {
        edgeMatchesKey: true,
        anyOf: [{ $ref: "schema.json#/definitions/ThingEdge" }]
      }
    }
  },

  GenericSignedData: {
    // XXX: deprecated
    title: "Generic SEA Node",
    description:
      "Older user thing lists did not have deterministic souls, still migrating",
    soul: {
      pattern: "*path~:authorId.",
      properties: {
        path: { type: "string" },
        authorId: { $ref: "schema.json#/definitions/seaAuthorId" }
      },
      required: ["path", "authorId"]
    },
    additionalProperties: {
      sea: {
        edgeMatchesKey: true,
        anyOf: [{ $ref: "schema.json#/definitions/ThingEdge" }]
      }
    }
  }
};

const routes = keys(definitions).reduce((result, name) => {
  const pattern = path([name, "soul", "pattern"], definitions);
  if (!pattern) return result;
  return assoc(name, new Route(pattern), result);
});

const validateIsLegacyThing = (
  schema,
  data,
  pSchema,
  cPath,
  parentData,
  keyInParent
) => {
  const dataSoul = path(["data", "#"], data);
  const newest = without(
    ["comments", "allcomments", "votesup", "votesdown"],
    keys(path(["_", ">"], data))
  )
    .map(key => path(["_", ">", key], data))
    .sort()
    .pop();
  const { thingId } = routes.ThingData.match(dataSoul) || {};
  const id = prop("id", data);
  return id && id === thingId && newest && newest < 1543102814945;
};

const validateThingHashMatchesSoul = (_schema, data) => {
  const id = prop("id", data);
  return (
    id &&
    id ===
      objHash({
        authorId: (path(["author", "#"], data) || "").substr(1) || undefined,
        timestamp: parseInt(prop("timestamp", data)),
        kind: prop("kind", data),
        topic: prop(
          "topicName",
          routes.Topic.match(path(["topic", "#"], data))
        ),
        opId: prop("thingId", routes.Thing.match(path(["op", "#"], data))),
        replyToId: prop(
          "thingId",
          routes.Thing.match(path(["replyTo", "#"], data))
        ),
        originalHash: prop("originalHash", data)
      })
  );
};

const validateSignedThingDataMatches = (_schema, data) => {
  const authorId = (path(["author", "#"], data) || "").substr(1) || undefined;
  const signedId = prop(
    "authorId",
    routes.ThingDataSigned.match(path(["data", "#"], data))
  );
  return authorId && authorId === signedId;
};

const validateThingDataMatchesOriginalHash = (_schema, data) => {
  const originalHash = prop("originalHash", data);
  const id = prop("thingId", routes.ThingData.match(path(["data", "#"], data)));
  return id && id === originalHash;
};

const validateThingRelatedEdge = ajv => (
  nodeTypeName,
  data,
  _pSchema,
  _cPath,
  parentData
) => {
  const { thingId } =
    routes.Thing.match(path(["_", "#"], parentData) || "") || {};
  const { thingId: propThingId } = routes[nodeTypeName].match(
    prop("#", data) || ""
  );
  if (!thingId || thingId !== propThingId) return false;
  return ajv.compile({ $ref: `schema.json#/definitions/${nodeTypeName}Edge` })(
    data
  );
};

const validateThingDataHash = (_schema, data) => {
  const { _, ...record } = data || {}; // eslint-disable-line no-unused-vars
  record.timestamp = parseFloat(record.timestamp, 10);
  const { thingId } =
    routes.ThingData.match(path(["_", "#"], data) || "") || {};
  return thingId && thingId === objHash(record);
};

const validateKeysAreProofsOfWork = (schema, data) => {
  const { algorithm = "argon2d", config = {} } = schema || {};
  const prefix = path(["_", "#"], data);
  if (algorithm !== "argon2d")
    throw new Error("Only argon2 supported for vote hashes");
  without(["_"], keys(data)).forEach(vote => {
    const nonce = Buffer.hasOwnProperty("from")
      ? Buffer.from(vote, "hex")
      : new Buffer(vote, "hex");
    const salt = Buffer.hasOwnProperty("from")
      ? Buffer.from(nonce, "hex")
      : new Buffer(nonce, "hex");
    const hash = argon2.hash(prefix, {
      salt,
      hashLength: config.hashLength,
      timeCost: config.timeCost,
      memoryCost: config.memoryCost,
      parallelism: config.parallelism,
      raw: true,
      type: argon2[algorithm]
    });
    let off = 0;
    let i;
    for (i = 0; i <= config.complexity - 8; i += 8, off++) {
      if (hash[off] !== 0) return false;
    }
    const mask = 0xff << (8 + i - config.complexity);
    const isValid = (hash[off] & mask) === 0;
    if (!isValid) {
      console.log("invalid vote", prefix, vote);
      delete data[vote];
    }
  });
  return true;
};

const initAjv = compose(
  ajv => {
    ajv.addKeyword("isLegacyThing", {
      validate: validateIsLegacyThing
    });
    ajv.addKeyword("thingHashMatchesSoul", {
      validate: validateThingHashMatchesSoul
    });
    ajv.addKeyword("signedThingDataMatchesThing", {
      validate: validateSignedThingDataMatches
    });
    ajv.addKeyword("thingDataMatchesOriginalHash", {
      validate: validateThingDataMatchesOriginalHash
    });
    ajv.addKeyword("thingRelatedEdge", {
      validate: validateThingRelatedEdge(ajv)
    });
    ajv.addKeyword("thingDataHashMatchesSoul", {
      validate: validateThingDataHash
    });
    ajv.addKeyword("keysAreProofsOfWork", {
      validate: validateKeysAreProofsOfWork,
      modifying: true
    });
    return ajv;
  },
  sea.initAjv
);

module.exports = createSuppressor({ definitions, initAjv });
