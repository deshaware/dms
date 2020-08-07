const app = require('../app');
const request = require("supertest");

afterAll( (done) => {
    console.log("done");
    process.exit();
})

describe("Test", () => {

    it('should test that true === true', () => {
        expect(true).toBe(true)
    });

    it("Should check if server is running", async (done) => {
        const result = await request(app).get("/login").set('Accept', 'application/json');
        assert(result.status).toBe(200)
        expect(result.status).toBe(200)
        done();
    });
})