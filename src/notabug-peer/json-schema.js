import { assoc, path, keys } from "ramda";
import Route from "route-parser";
import * as sea from "gun-suppressor-sear";
import * as consts from "./constants";

export const definitions = {
  ...sea.AUTH_SCHEMA,
  topicName: {
    type: "string",
    minLength: 1,
    maxLength: consts.MAX_TOPIC_SIZE
  },

  TopicDay: {
    title: "Topic Day",
    description: "A single day of things in a topic",
    soul: {
      pattern: `${consts.PREFIX}/topics/:topicName/days/:year/:month/:day`,
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
      pattern: `${consts.PREFIX}/topics/:topicName`,
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
    maxLength: consts.MAX_DOMAIN_SIZE
  },

  Domain: {
    title: "Domain",
    description: "All things in a domain",
    soul: {
      pattern: `${consts.PREFIX}/domains/:domainName`,
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
      pattern: `${consts.PREFIX}/urls/\*url`, // eslint-disable-line no-useless-escape
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
    maxLength: consts.MAX_HASH_SIZE
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
      pattern: `${consts.PREFIX}/things/:thingId/allcomments`,
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
      pattern: `${consts.PREFIX}/things/:thingId/comments`,
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
    maxLength: consts.MAX_THING_KIND_SIZE
  },

  Thing: {
    title: "Thing Reference",
    description:
      "These are submissions, comments, chat messages and wiki pages",
    soul: {
      pattern: `${consts.PREFIX}/things/:thingId`,
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
          id: { $ref: "#/definitions/thingId" },
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
      pattern: `${consts.PREFIX}/things/:thingId/votesup`,
      allOf: [{ $ref: "schema.json#/definitions/thingSoul" }]
    },
    allOf: [{ $ref: "#/definitions/ProofOfWorkVotes" }]
  },

  ThingVotesDown: {
    soul: {
      pattern: `${consts.PREFIX}/things/:thingId/votesdown`,
      allOf: [{ $ref: "schema.json#/definitions/thingSoul" }]
    },
    allOf: [{ $ref: "#/definitions/ProofOfWorkVotes" }]
  },

  ThingData: {
    title: "Unsigned Thing Data",
    description: "This is the actual content of a thing",
    soul: {
      pattern: `${consts.PREFIX}/things/:thingId/data`,
      allOf: [{ $ref: "schema.json#/definitions/thingSoul" }],
      required: ["thingId"]
    },
    properties: {
      kind: { $ref: "#/definitions/thingKind" },
      title: {
        type: "string",
        minLength: 1,
        maxLength: consts.MAX_THING_TITLE_SIZE
      },
      topic: { $ref: "#/definitions/topicName" },
      body: { type: ["null", "string"], maxLength: consts.MAX_THING_BODY_SIZE },
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
      pattern: `${consts.PREFIX}/things/:thingId/data~:authorId.`,
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
          maxLength: consts.MAX_THING_TITLE_SIZE
        }
      },
      topic: { sea: { $ref: "schema.json#/definitions/topicName" } },
      body: {
        sea: { type: ["null", "string"], maxLength: consts.MAX_THING_BODY_SIZE }
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
      pattern: `${consts.PREFIX}/things/:thingId/votecounts@~:tabulatorId.`,
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
      ids: { sea: { type: "string", maxLength: consts.MAX_LISTING_IDS_SIZE } },
      source: {
        sea: { type: "string", maxLength: consts.MAX_LISTING_SOURCE_SIZE }
      },

      // XXX: rest are deprecated in favor of source
      name: { sea: { type: ["string", "null"], maxLength: consts.MAX_TOPIC_SIZE } },
      submitTopic: {
        sea: { type: "string", maxLength: consts.MAX_TOPIC_SIZE }
      },
      tabs: {
        sea: { type: "string", maxLength: consts.MAX_LISTING_TABS_SIZE }
      },
      curators: {
        sea: { type: "string", maxLength: consts.MAX_LISTING_SOURCE_SIZE }
      },
      censors: {
        sea: { type: "string", maxLength: consts.MAX_LISTING_SOURCE_SIZE }
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
      pattern: `${consts.PREFIX}/t/:topic/:sort@~:indexer.`,
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
      pattern: `${consts.PREFIX}/domain/:domain/:sort@~:indexer.`,
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
      pattern: `${consts.PREFIX}/things/:thingId/comments/:sort@~:indexer.`,
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
      pattern: `${consts.PREFIX}/user/:authorId/replies/:type/:sort@~:indexer.`,
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
      pattern: `${consts.PREFIX}/user/:authorId/:type/:sort@~:indexer.`,
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
      pattern: `${consts.PREFIX}/user/:authorId/spaces/:name/:sort@~:indexer.`,
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
      pattern: `${consts.PREFIX}/comments~:authorId.`,
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
      pattern: `${consts.PREFIX}/submissions~:authorId.`,
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
      pattern: `${consts.PREFIX}/things~:authorId.`,
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
      pattern: `${consts.PREFIX}/pages~:authorId.`,
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

export const routes = keys(definitions).reduce((result, name) => {
  const pattern = path([name, "soul", "pattern"], definitions);
  if (!pattern) return result;
  return assoc(name, new Route(pattern), result);
});
