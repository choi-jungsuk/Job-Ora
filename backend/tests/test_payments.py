import asyncio
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import httpx
from main import app

async def run_tests():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        print("\n=== 1. Testing GET /products ===")
        res = await client.get("/products")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        products = res.json()
        assert len(products) == 2, f"Expected 2 products, got {len(products)}"
        assert products[0]["product_id"] == "trial_interview"
        assert products[0]["amount"] == 1000
        assert products[1]["product_id"] == "basic_interview"
        assert products[1]["amount"] == 2000
        print("  [OK] GET /products passed successfully:", products)

        print("\n=== 2. Testing POST /payments/orders (Trial Product) ===")
        res = await client.post("/payments/orders", json={
            "product_id": "trial_interview",
            "customer_email": "tester@example.com"
        })
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        order1 = res.json()
        assert "order_id" in order1
        assert order1["amount"] == 1000
        assert order1["customer_email"] == "tester@example.com"
        print("  [OK] Order created for trial product:", order1["order_id"])

        print("\n=== 3. Testing POST /payments/orders (Basic Product) ===")
        res = await client.post("/payments/orders", json={
            "product_id": "basic_interview",
            "customer_email": "user@granosoai.com"
        })
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        order2 = res.json()
        assert order2["amount"] == 2000
        assert order2["order_id"].startswith("JOBORA-")
        print("  [OK] Order created for basic product:", order2["order_id"])

        print("\n=== 4. Testing POST /payments/orders Validation Errors ===")
        # Invalid product_id
        res = await client.post("/payments/orders", json={
            "product_id": "invalid_plan",
            "customer_email": "test@example.com"
        })
        assert res.status_code == 400
        print("  [OK] Invalid product correctly rejected with 400")

        # Invalid email
        res = await client.post("/payments/orders", json={
            "product_id": "trial_interview",
            "customer_email": "not-an-email"
        })
        assert res.status_code == 400
        print("  [OK] Invalid email correctly rejected with 400")

        print("\n=== 5. Testing Order Status Query ===")
        res = await client.get(f"/payments/orders/{order2['order_id']}")
        assert res.status_code == 200
        order_status = res.json()
        assert order_status["status"] == "pending"
        print("  [OK] Order status retrieved, currently pending:", order_status["status"])

        print("\n=== 6. Testing POST /payments/toss/confirm Validation ===")
        # Non-existent order
        res = await client.post("/payments/toss/confirm", json={
            "paymentKey": "test_pk_12345",
            "orderId": "NON_EXISTENT_ORDER",
            "amount": 2000
        })
        assert res.status_code == 404
        print("  [OK] Non-existent order correctly rejected with 404")

        # Amount mismatch
        res = await client.post("/payments/toss/confirm", json={
            "paymentKey": "test_pk_12345",
            "orderId": order2["order_id"],
            "amount": 9999
        })
        assert res.status_code == 400
        print("  [OK] Amount mismatch correctly rejected with 400")

        print("\n=== 7. Testing Mock Confirm Success and Idempotency ===")
        res = await client.post("/payments/toss/confirm", json={
            "paymentKey": "test_mock_payment_001",
            "orderId": order2["order_id"],
            "amount": 2000
        })
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        confirm1 = res.json()
        assert confirm1["success"] is True
        assert confirm1["credit_count"] == 1
        assert confirm1["order_id"] == order2["order_id"]
        print("  [OK] Mock confirm approved and issued one credit")

        res = await client.post("/payments/toss/confirm", json={
            "paymentKey": "test_mock_payment_001",
            "orderId": order2["order_id"],
            "amount": 2000
        })
        assert res.status_code == 200
        confirm2 = res.json()
        assert confirm2.get("already_confirmed") is True
        assert confirm2["credit_count"] == 1
        print("  [OK] Duplicate confirm handled idempotently without duplicate credit")

        print("\n=== ALL BACKEND PAYMENT TESTS PASSED! ===")

if __name__ == "__main__":
    asyncio.run(run_tests())
