import { Validator } from "jsonschema";
import { NextFunction, Request, Response } from "express";

export const ensurePayload = (keys: string[] = []) => {
  const schema = {
    type: "object",
    properties: keys.reduce((acc, key) => {
      acc[key] = { type: "any" };
      return acc;
    }, {}),
    required: keys,
    additionalProperties: true,
    minProperties: 1,
  };

  return (req: Request, res: Response, next: NextFunction) => {
    const validator = new Validator();
    const validationResult = validator.validate(req.body, schema);

    if (!validationResult.valid) {
      return res.status(400).send({
        message: validationResult.errors.map(error => error.stack).join(", "),
      });
    }

    next();
  };
};
