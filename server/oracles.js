import { query } from "gun-scope";
import { oracle } from "gun-cleric";
import { basic } from "gun-cleric-scope";
import { ListingOracle, Listing, Schema, Tabulator } from "notabug-peer";

const throttleGet = 1000 * 60 * 60 * 8;

export const tabulator = oracle({
  name: "tabulator",
  routes: [
    basic({
      path: Schema.ThingVoteCounts.soul.pattern,
      query: Tabulator.query
    })
  ]
});

export const indexer = oracle({
  name: "indexer",
  routes: [
    basic({
      path: Schema.TopicListing.soul.pattern.replace(":sort", "chat"),
      throttleGet,
      onPut: ListingOracle.onPut,
      query: query((scope, { match: { topic } }) =>
        Listing.nodeFromPath(scope, `/t/${topic}/chat`)
      )
    }),

    basic({
      path: Schema.TopicListing.soul.pattern.replace(":sort", "firehose"),
      throttleGet,
      onPut: ListingOracle.onPut,
      query: query((scope, { match: { topic } }) =>
        Listing.nodeFromPath(scope, `/t/${topic}/firehose`)
      )
    }),

    basic({
      path: Schema.TopicListing.soul.pattern,
      throttleGet,
      onPut: ListingOracle.onPut,
      query: query((scope, { match: { topic, sort } }) =>
        Listing.nodeFromPath(scope, `/t/${topic}/${sort}`)
      )
    }),

    basic({
      path: Schema.DomainListing.soul.pattern,
      throttleGet,
      onPut: ListingOracle.onPut,
      query: query((scope, { match: { domain, sort } }) =>
        Listing.nodeFromPath(scope, `/domain/${domain}/${sort}`)
      )
    }),

    basic({
      path: Schema.AuthorRepliesListing.soul.pattern,
      // onPut: Listing.InboxListing.onPut,
      query: query((scope, { match: { authorId, type, sort } }) =>
        Listing.nodeFromPath(scope, `/user/${authorId}/replies/${type}/${sort}`)
      )
    }),

    basic({
      path: Schema.AuthorProfileListing.soul.pattern.replace(
        ":type",
        "commented"
      ),
      query: query((scope, { match: { authorId, sort } }) =>
        Listing.nodeFromPath(scope, `/user/${authorId}/commented/${sort}`)
      )
    }),

    basic({
      path: Schema.AuthorProfileListing.soul.pattern,
      onPut: Listing.ProfileListing.onPut,
      throttleGet,
      query: query((scope, { match: { authorId, type, sort } }) =>
        Listing.nodeFromPath(scope, `/user/${authorId}/${type}/${sort}`)
      )
    })
  ]
});

export const comments = oracle({
  name: "comments",
  routes: [
    basic({
      path: Schema.ThingCommentsListing.soul.pattern,
      onPut: ListingOracle.onPut,
      throttleGet,
      query: query((scope, { match: { thingId, sort } }) =>
        Listing.nodeFromPath(scope, `/things/${thingId}/comments/${sort}`)
      )
    })
  ]
});

export const spaces = oracle({
  name: "spaces",
  routes: [
    basic({
      path: Schema.SpaceListing.soul.pattern,
      query: query((scope, { match: { authorId, name, sort } }) =>
        Listing.nodeFromPath(scope, `/user/${authorId}/spaces/${name}/${sort}`)
      )
    })
  ]
});
