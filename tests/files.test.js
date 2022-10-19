require("dotenv").config();

const AWS = require("aws-sdk");

const Bucket = process.env.BUCKET;
const ACCESS_KEY = process.env.ACCESS_KEY;

jest.mock("aws-sdk", () => {
  let instance = {
    upload: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };
  return { S3: jest.fn(() => instance) };
});

describe("Testing s3 bucket features", () => {
  let testBucket;
  beforeEach(() => {
    testBucket = new AWS.S3();
    testBucket.promise.mockReturnValueOnce({ Bucket: Bucket });
  });

  test("returns expected upload value", async () => {
    const params = {
      Bucket: Bucket,
      Key: ACCESS_KEY,
      ACL: "public-read",
      ContentType: "application/json",
      Body: Buffer.from("./test.txt"), // simple text file upload test
    };
    const result = await testBucket.upload(params).promise();
    expect(result).toEqual({ Bucket: Bucket });
    expect(result.Bucket).toBe(Bucket);
  });
});
