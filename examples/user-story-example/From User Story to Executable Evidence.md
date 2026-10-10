# From User Story to Executable Evidence

Testing an API becomes much easier once you know what behavior matters.

That sounds obvious, but it points to a problem with the way we often approach testing. We start with the API: endpoints, methods, schemas, and status codes. Then we write tests for them.

But an API can pass all those tests and still fail to do what its users need.

A better place to start is the user story.

Consider a simple example:

> As a user, I want to create a new task in order to keep track of my work.

The story gives us intent, but it isn't a test script. It doesn't tell us which HTTP method to use, what request body to send, or which status code to expect.

Instead, we can ask three questions:

**What behavior is explicit, required, or implied by this story?**

The explicit behavior is easy: a user can create a task.

Other behaviors are required for that claim to be useful. A successful creation must be distinguishable from an unsuccessful one. The created task must be identifiable.

And some behaviors are implied. If the purpose is to keep track of work, we might reasonably expect the created task to remain available afterward.

This gives us behavioral claims, not tests.

The next question is:

**What evidence would convince us that each claim is true?**

For our task story, useful evidence might include:

- a valid creation request succeeds;
- the response identifies the created task;
- the task can subsequently be retrieved;
- the retrieved task is the one we created.

Now we can bring the API description into the picture.

OpenAPI tells us how those observations can be made. Perhaps creation is `POST /tasks`, successful creation returns `201`, and an individual task can be retrieved with `GET /tasks/{id}`.

Only now do we need executable assertions.

TRAM can express those observations as a behavioral test: create the task, verify the response, capture its identifier, retrieve that identifier, and verify the resulting representation.

The progression looks like this:

**User Story → Explicit / Required / Implied → Behavioral Claims → Evidence → OpenAPI Binding → TRAM Manifest → Results**

Each artifact contributes something different.

The user story supplies intent.

Explicit, Required, and Implied analysis helps decide which behaviors deserve attention.

OpenAPI supplies the HTTP mechanics.

TRAM turns the selected observations into executable assertions and produces evidence from a running API.

The distinction matters.

We aren't generating tests because an endpoint exists. We're generating tests because we have a behavioral claim worth verifying.

And that gives us something more useful than a collection of passing endpoint checks.

It gives us evidence that the API does what we said it should do.