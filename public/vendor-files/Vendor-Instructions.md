# Bagger McGee vendor product template

Use **Bagger-McGee-Vendor-Template.csv** for your real products. The separate **Bagger-McGee-FICTIONAL-Example.csv** contains invented products, prices, brands, and links for illustration only. Do not submit those example rows as real inventory.

## Fill the template

1. Open the blank CSV in Excel or another spreadsheet editor. Keep the header names unchanged. Start entering products in row 2, one offer/variant per row, for one vendor per file.
2. Keep vendor SKUs and manufacturer part numbers as text so leading zeros and hyphens remain intact. When importing into Excel, set those columns to Text. CSV files cannot enforce cell types or dropdowns.
3. Fill the columns below. Do not guess missing brand, part number, variant, origin, or condition information. Ask for clarification if required identity data is unavailable.
4. Save as **CSV UTF-8 (comma-delimited)**. Keep the original file as a backup. Maximum intake size: 10,000 product rows and 5 MiB.

| Column | What to enter |
| --- | --- |
| `vendorSku` | Required. Your unique product/variant identifier, up to 200 characters. Do not repeat a SKU within the file. |
| `name` | Required. Product name, up to 500 characters. |
| `brandName` | Required. Actual brand, up to 200 characters. |
| `manufacturerPartNumber` | Required. Manufacturer's part number, up to 200 characters. Preserve punctuation and leading zeros. |
| `variantAttributes` | Required. Variant details as a JSON object. Example: `{"finish":"black","size":"large"}`. If the item has no variants, enter `{}`. Use double quotes as shown. Each different variant gets its own SKU and row. Ask us for help if you are unsure how to enter this column. |
| `destinationUrl` | Required. Public HTTPS link to that exact product/variant. Do not include passwords, login tokens, or private account links. |
| `itemPrice` | Required. Item price in US dollars, such as `199.00`. No dollar sign, thousands separators, shipping, or tax. Maximum two decimal places. Do not use zero to mean an unknown price. |
| `currency` | Required. Enter `USD`. Other currencies are not supported in this intake version. |
| `quantity` | Required. Positive whole number, such as `1`. Do not enter zero for unavailable items. Confirm multipack quantities with Bagger McGee before submitting. |
| `origin` | Enter `oem` or `aftermarket` when known. Leave blank if unknown. Do not type `unknown`, `N/A`, or a guess. |
| `condition` | Enter `new` or `used` when known. Leave blank if unknown. Refurbished and other conditions need separate review and are not accepted by this intake version. |

No formulas, extra columns, subtotal rows, or explanatory text above the header. Enter values in spreadsheet cells normally; the spreadsheet editor handles CSV quoting when you save.

## What happens next

In the private app, choose **Upload vendor CSV**, select your file, and click **Preview file**. Fix any reported issues and preview again. Choose the correct vendor (or add its name and public website as an inactive record), then click **Import into private review queue**. Only the Owner can upload. The fictional example is preview-only. Repeated imports of the same parsed file for the same vendor preserve existing reviews.

Products remain private and require review. Passing format checks does not verify authenticity, fitment, product identity, price accuracy, or evidence. This template does not yet collect model/year fitment, shipping rates, stock availability, or images. Do not treat omitted information as confirmed or assume a product fits a particular motorcycle.

The fictional example includes two separate finish variants and a third item with unknown origin and condition left blank. Its `example.com` links are placeholders, not purchasable products.

