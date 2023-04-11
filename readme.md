# Overview
The MonQcle legacy API was written in Express over a 6 year period, primarally by [Ning Gong](mailto:ning.gong@temple.edu), who was the pricipal MonQcle architect who left the project in September 2019. No knowledge transfer was provided and no original documentation was ever created. The current documentation (below) was written by [Nick Steele](njsteele@gmail.com) by exploring the API output and looking through source code.

# Dataset  API Endpoint

Querying for a dataset is simple, and only requires knowing the ObjectId of the datset:

```https://www.monqcle.com/api/v4.0/dataset/query/:ObjectId```

## ObjectId
ObjectIds are MongoDB artififacts. Note that it is a security risk to expose database IDs to the public. This was an error noted on the old platform. This is addressed in the new MonQcle API (this is the legacy MonQcle API).

MongoDB ObjectIds are similar to UUIDs, in that they are just small, likely unique, fast to generate, and ordered. ObjectId values are 12 bytes in length, consisting of:

A 4-byte timestamp, representing the ObjectId's creation, measured in seconds since the Unix epoch.

A 5-byte random value generated once per process. This random value is unique to the machine and process.

A 3-byte incrementing counter, initialized to a random value.

See [MongoDB documentation](https://www.mongodb.com/docs/v2.4/reference/object-id/) for more information on this, as this is not a Temple development, but an exposed MongoDB development.

## API Query parameters

All Query parameters are optional and follow REST standards. They follow this format:

```https://www.monqcle.com/api/v4.0/dataset/query/:ObjectId?:param=value&param2=value2```

The following is a list of available paramters:

### get_deleted
Optional. If true, will return deleted entries. False by default.

### get_hidden
Optional. If true, will return hidden entries. False by default.


## API Result

The result of a dataset query will always be in JSON and contain 2 arrays and an object:

```
{
    "mappable_data": [Array],
    "questions_answers": [Array],
    "details": {Object}
}
```

# details

Used to populate UI basics. Only contains 3 items an pretty self-explanitory.

```
{
    "title": "Human readable title of the dataset",
    "id": "ObjectId",
    "slug": "SEO/web version of the title with dashes instead of spaces"
}
```

# questions_answers

An array containing each question and it's respective answers within the dataset. There will always be an object entry for each and every question within the dataset. For example "local-eviction-laws" contains 57 "questions_answers" objects within it's array because it has 57 questions including unique child questions.

Note: Two parent question can possiblly use the same child question, as long as the child question always has the same citation (described later).

Object description...

```
{
	"question": "human readable question",
	"id": "ObjectID",
    "name": "ObjectID", // Identical to id for historic reasons
    "slug": "ObjectID", // Identical to id for historic reasons
	"description": "String - Usually blank",
	"note": "Enum String",
	"children": [ // False if empty for legacy compliance 
        "ObjectIds" // one for each child question
    ],
	"group": "Same as details.slug for legacy compliance",
	"type": "Enum String (see types below)",
    "total": 0, // Only appears if type is "Numeric field"
	"answers": [
		"Strings - Human readable answers"
	],
	answer_ids: [
		"ObjectIds" // 1:1 to answers array
	]
}
```

## Answer Types

1. "Categorical - check all that apply" (i.e. select one or many from answers")
2. "Categorical - mutually exclusive" (i.e. "select one from answers")
3. "Binary - mutually exclusive" (i.e. "yes/no")
4. "Numeric field" (uses the "total" field)

## Answer children
If the question contains children, i.e. sub-questions, the question will list it's ObjectId(s) in the children array. The ObjectId of the child question will also be in the questions_answers array.

Note: A question can be utilized in many parent questions (i.e. one question can be used as a child question within several other questions - there is no exclusivity)

# mappable_data

Each entry in this array represents the state of laws for a single period of time in a single jurisdiction, also called a series or batch.

Each jurisdiction in a dataset, if represented at least once, will have at least one entry in the mappable_data array. Each jurisdiction will be represented more than once if the laws changed during a period of time. For example, if the dataset covers local eviction laws from 1900 to 2000, Las Vegas may be represented 3 times if the law was one way from 1900-1944, another way from 1944-1979, and another way from 1979-2000.

So for a 50 state survey covering 100 years, if 49 states only have one condition for their laws for the entire period, but 1 state has 3 changes to their laws for that period, there will be 49+3 = 52 entries in the "mappable_data" array, 1 for each of the 49 states, and 3 for the 3 different periods of laws for 1 state.

For example, local-eviction-laws has 75 objects in this array, meaning there are not 75 jurisdictions in the dataset, but 75 states of law within 1 or more jurisdictions. This could mean a single jurisdiction with 75 changes, for example, or, 50 states, with 25 additional states of law or chronological changes within those states.

**Determiniing jurisdictions / Time series count**

The only way to know the number of jurisdictions and times the laws changed within a dataset is to go through this array, creating a new array of different jurisdictions identified, and appending "effective" and "through" series to each of the jurisdictions. **This is a known limitation with the way Temple decided to offer datasets in the past**.

> Note: There is an extreme amount of duplicate data contained in this section due to funding restrictions and a resulting lack of documentation. In the past, engineers did not know where to find data within results, so they re-created the output in the API results multiple times. Below, we mark areas as "depreciated/duplicate data" or "same/similar" where entries are located in less than ideal locations.

> Note: At the root level of each series/batch are answer IDs. This is a less than ideal location and are an exact duplicate of the "answers" path. For example, if "answers" contain 57 keys with IDs, there will also be those identical 57 Id keys at the root level. This are not described below. Ignore these in practice.

```
{
            "jurisdiction_id": "ObjectId for jurisdiction",
            "id": "5ff902595594f445198b4568",
            "series_root": "ObjectId for this series",
            "series_root_title": "Las Vegas, NV Batch 1",
            "name": "Jurisdiction name",
            "type": "Enum String",
            "lat": "Lattitude center",
            "lon": "Longitude center",
            "state": "If city, the state name, or empty",
            "state_fips": "If city, StateId, or empty",
            "state_code": "If city, State abbriviation, or empty",
            "series_title": "Batch 1",
            "group": "Same as dataset slug",
            "title": "Unused",
            "version": "Unused",
            "_hidden": Boolean: hides the dataset from public,
            "_deleted": Boolean: "deletes" the dataset by flagging it for later true deletion (a simple trashcan implementation),
            "_marked_finished": Boolean: true if the dataset is considered complete,
            "completed": Number of answers completed in this record,
            "answers": {

            },
            "cautions": {
                "ObjectId": "Cautionary text or empty"
            },
            "effective": { // Law start
                "sec": Unix timecode (seconds since 1/1/1970),
                "usec": Depreciated - Microseconds, always 0.
            },
            "through": { // Law end
                "sec": Unix timecode (seconds since 1/1/1970),
                "usec": Depreciated - Microseconds, always 0.
            },
            "laws": [
                "ObjectIds" // Laws this entry covers
            ],
            "jur_raw": { // depreciated / duplicate data
                { same/similar jurisdiction properties go here }
            },
            "props": { // depreciated / duplicate data
                { same/similar jurisdiction properties go here }
            },
}
```
## Jurisdiction Types

The path "mappable_data[item].type" contains the jurisdiction type enum, which can be:

1. "cities"
2. "states"
3. "other"

## Cautions
Questions may have links to cautions in each jurisdiction under "mappable_data[item].cautions"

## Citations
Citations are sliced out sections of the original full legal text which contain the proof that the questions have the answer documented.  This lets a human go back and verify the answers are correct (by citing the legal text), and also provides the specifical legal text (although not the entire legal text) so the human can quickly read the law being cited to see if it aligns.

Questions will always have links to citations in each jurisdiction under "mappable_data[item].citations"

> Example: In local-eviction-laws, there is question with ObjectId "5fd7a9f6f5f53c63028b4567" titled "Is there a law regulating residential evictions?", this is a "yes/no" question. It is located at result.questions_answers[0], it's id field matches the ObjectId referenced elsewhere in the dataset. In series 0 (result.mappable_data[0], titled "Las Vegas, NV Batch 1", it covers jurisdiction "54f8b2346eb07acf618b485f" (the city of "Las Vegas, NV" in the United States of America)), it references this yes/no question in both cautions (has no caution) and citations (featured as citation 0 of series 0 in the dataset, i.e. result.mappable_data[0].citations[0]), which covers the first batch of Las Vegas data (there may be multiple batches if the applicable cited law in Las Vegas changes over time, otherwise, there will be only one) 

Specific citation example (from note above)
```
{
    // ObjectId for the citation
    "id": "6001e38e5594f43d528b456c",

    // Text featured in the citation itself, taken from the original legal text
    "text": "2.\u2002\u2002The owner of the real property, an authorized representative of the owner or the occupant who is authorized by the owner to be in possession of the real property may seek to recover possession of the property pursuant to NRS 40.290 to 40.420, inclusive, after the expiration of the notice to surrender served by the owner or authorized occupant upon the person who committed the forcible detainer. The notice must:      (a)\u2002Inform the person who committed the forcible detainer that he or she is guilty of a forcible detainer; and      (b)\u2002Afford the person who committed the forcible detainer 4 judicial days to surrender the property.      3.\u2002\u2002If an owner of real property or an authorized representative of the owner recovers damages for a forcible detainer, judgment may be entered for three times the amount at which the actual damages are assessed. As used in this section, \u201cactual damages\u201d means damages to real property and personal property.",

    // Where the citation can be found (which legal text, and which section within it)
    "path": "Nev. Rev. Stat. \u00a7 40.240",
    // optional tags used for search purposes
    "tags": [
        "seeking possession after forcible detainer"
    ],
    // The laws ObjectId (if referenced elsewhere)
    "laws": "5ff902965594f445198b4574",
    // The full title of the law being cited (just like "path", but more human-readable, with text)
    "title": "Nev. Rev. Stat. \u00a7 40.240. Forcible detainer defined; recovery of possession following forcible detainer; treble damages"
}          
```

> Note: Datasets do not contain the entire legal text, only a citation and clip of relevant text that answers a specific question.  The answers themselves are codified and machine readable

## Mapping a legal citation for a dataset to a codified answer

The reverse of finding citations to questions, finding codified answers to citations are performed in the exact reverse order of the citation example above.

> Example: Finding the codified question to a specific citation - Given any citation in a dataset, i.e. at mappable_data[n].citations[n], for example mappable_data[0].citations['5fd7a9f6f5f53c63028b4567'], which contains the legal text pertaining to the answer for the question with the same id ('5fd7a9f6f5f53c63028b4567'), you simply find questions_answers[n].id = '5fd7a9f6f5f53c63028b4567', which in this case, with local-eviction-laws, is a boolean yes/no of "Is there a law regulating residential evictions?"

> Example: Finding all citations for any codified question.  This is covered in "citations" above. Just find all mappable_data[n - jurisdiction / series] where id = question ObjectId.
