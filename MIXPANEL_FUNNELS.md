# How to Use Mixpanel Funnels for Maison Slimani

Funnels are the **most powerful feature** for e-commerce because they show you exactly where you lose customers.

## 🚀 Setting Up Your "Purchase Funnel"

Go to **Reports** → **Funnels** in Mixpanel and create this step-by-step flow:

### The Steps:

| Step | Event Name (We just implemented these) | What it means |
|------|----------------------------------------|---------------|
| **1. View** | `Page Viewed` | User visits the site |
| **2. Interest** | `Product Viewed` | User looks at a specific product |
| **3. Intent** | `Product Added to Cart` | User wants to buy |
| **4. Action** | `Checkout Started` | User goes to checkout page |
| **5. Value** | `Order Completed` | User finishes purchase |

### 💡 How to Read the Data

Once this is running for a few days, you will see a percentage drop-off between each step.

**Example Scenario & Fixes:**

1. **Big drop between Product View → Add to Cart?**
   - *Diagnosis:* Price might be too high, or images aren't good enough.
   - *Fix:* Improve product photos, add reviews, or check pricing.
   - *Mixpanel Action:* Click the "drop-off" bar to see **Session Replays** of people who viewed but didn't add to cart.

2. **Big drop between Add to Cart → Checkout?**
   - *Diagnosis:* Cart drawer might be confusing, or they are just browsing.
   - *Fix:* Add a "Buy Now" button (sticky) or offer free shipping info earlier.

3. **Big drop between Checkout → Order Completed?**
   - *Diagnosis:* **CRITICAL.** This means your checkout form is too long, broken, or they don't trust the site.
   - *Fix:* Simplify the form. You only need Name + Phone + City for Cash on Delivery (COD).
   - *Mixpanel Action:* Watch every single session replay of these users.

## 🔍 Second Funnel: "Search to Purchase"

Create a second funnel to see if your search works:

1. Step 1: `Search Performed`
2. Step 2: `Product Clicked` (or `Product Viewed`)
3. Step 3: `Order Completed`

**Insight:** If users search but don't click products, your search results are bad (or you don't have what they want). Check your `Zero Results Search` report.
