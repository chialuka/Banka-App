const server = require("../index");
const chai = require("chai");
const chaiHttp = require("chai-http");

const expect = chai.expect;

chai.use(chaiHttp);

describe("POST User", () => {
  it("it should POST a user", done => {
    chai
      .request(server)
      .post("/api/users")
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a("object");
        expect(res.body).to.include.key("status");
        expect(res.body).to.include.any.keys("data", "error");
        done();
      });
  });
});
