const { app } = require("../src/app");
const request = require("supertest");

afterAll( (done) => {
    console.log("done");
})

describe("Test", () => {

    describe("Test the root path", () => {
        test("It should response the GET method", async () => {
          const response = await request(app).get("/");
          expect(response.statusCode).toBe(200);
        });
      });
})