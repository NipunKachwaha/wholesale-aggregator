import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize, requirePermission } from "../middleware/rbac.middleware";

const router = Router();

// ── Koi bhi logged-in user
router.get("/dashboard", authenticate, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Welcome to dashboard",
    user: {
      id: req.user!.userId,
      email: req.user!.email,
      role: req.user!.role,
      tenantId: req.user!.tenantId,
    },
  });
});

// ── Sirf Admin
router.get(
  "/admin-only",
  authenticate,
  authorize("admin"),
  (req: Request, res: Response) => {
    res.json({
      success: true,
      message: "Admin area — sirf admin dekh sakta hai",
    });
  },
);

// ── Admin ya Purchaser
router.get(
  "/orders-area",
  authenticate,
  authorize("admin", "purchaser"),
  (req: Request, res: Response) => {
    res.json({
      success: true,
      message: "Orders area — admin aur purchaser access kar sakte hain",
    });
  },
);

// ── Permission based
router.post(
  "/approve-order",
  authenticate,
  requirePermission("orders:approve"),
  (req: Request, res: Response) => {
    res.json({
      success: true,
      message: "Order approved",
      approvedBy: req.user!.email,
    });
  },
);

export default router;
