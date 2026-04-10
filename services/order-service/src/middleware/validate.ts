import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";

// Validation errors handle karo
export const handleValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: "Validation failed",
      code: "VALIDATION_ERROR",
      details: errors.array().map((e) => ({
        field: e.type === "field" ? e.path : "unknown",
        message: e.msg,
      })),
    });
    return;
  }
  next();
};

// ── Order create validation
export const createOrderValidation = [
  body("lineItems")
    .isArray({ min: 1 })
    .withMessage("lineItems array required with at least 1 item"),

  body("lineItems.*.sku")
    .notEmpty()
    .withMessage("Har line item mein SKU required hai"),

  body("lineItems.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity kam se kam 1 honi chahiye"),

  body("lineItems.*.unitPrice")
    .isFloat({ min: 0 })
    .withMessage("Unit price 0 ya usse zyada hona chahiye"),

  handleValidation,
];

// ── Status update validation
export const updateStatusValidation = [
  param("id").isUUID().withMessage("Valid order ID required"),

  body("status")
    .isIn(["confirmed", "processing", "fulfilled", "cancelled"])
    .withMessage(
      "Status: confirmed, processing, fulfilled, ya cancelled hona chahiye",
    ),

  handleValidation,
];
