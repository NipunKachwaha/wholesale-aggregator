import { Router, Request, Response } from "express";
import {
  createOrderValidation,
  updateStatusValidation,
} from "../middleware/validate";
import {
  createNewOrder,
  transitionOrderStatus,
} from "../services/order.service";
import {
  findOrderById,
  findAllOrders,
  deleteOrder,
} from "../models/order.model";

const router = Router();

const DEFAULT_TENANT = "00000000-0000-0000-0000-000000000001";

// ── POST /orders — Naya order banao
router.post("/", createOrderValidation, async (req: Request, res: Response) => {
  try {
    const tenantId = req.body.tenantId || DEFAULT_TENANT;
    const { lineItems, notes, buyerId } = req.body;

    const result = await createNewOrder({
      tenantId,
      buyerId,
      lineItems,
      notes,
    });

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error,
        code: "ORDER_CREATE_FAILED",
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Order create ho gaya",
      data: { order: result.order },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ── GET /orders — Saare orders
router.get("/", async (req: Request, res: Response) => {
  try {
    const tenantId = (req.query.tenantId as string) || DEFAULT_TENANT;
    const status = req.query.status as any;
    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "20");

    const orders = await findAllOrders(tenantId, status, page, limit);

    res.json({
      success: true,
      data: {
        orders,
        page,
        limit,
        total: orders.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /orders/:id — Ek order
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const tenantId = (req.query.tenantId as string) || DEFAULT_TENANT;
    const order = await findOrderById(req.params.id, tenantId);

    if (!order) {
      res.status(404).json({
        success: false,
        error: "Order nahi mila",
        code: "ORDER_NOT_FOUND",
      });
      return;
    }

    res.json({ success: true, data: { order } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── PATCH /orders/:id/status — Status update karo
router.patch(
  "/:id/status",
  updateStatusValidation,
  async (req: Request, res: Response) => {
    try {
      const tenantId = req.body.tenantId || DEFAULT_TENANT;
      const { status } = req.body;

      const result = await transitionOrderStatus(
        req.params.id,
        tenantId,
        status,
      );

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error,
          code: "STATUS_TRANSITION_FAILED",
        });
        return;
      }

      res.json({
        success: true,
        message: `Order status '${status}' ho gaya`,
        data: { order: result.order },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

// ── DELETE /orders/:id — Draft order delete karo
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const tenantId = (req.query.tenantId as string) || DEFAULT_TENANT;
    const deleted = await deleteOrder(req.params.id, tenantId);

    if (!deleted) {
      res.status(400).json({
        success: false,
        error: "Order delete nahi hua — sirf draft orders delete ho sakte hain",
        code: "DELETE_FAILED",
      });
      return;
    }

    res.json({
      success: true,
      message: "Order delete ho gaya",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
