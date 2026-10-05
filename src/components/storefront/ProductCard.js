import Image from "next/image";
import Link from "next/link";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";

import AddToCartButton from "@/components/storefront/AddToCartButton";

export default function ProductCard({
  product,
}) {
  const image =
    product.media?.find(
      (media) =>
        media.type === "image"
    )?.url;

  const discounted =
    product.compareAtPrice &&
    product.compareAtPrice >
    product.basePrice;

  const productUrl =
    `/product/${product.slug}`;

  return (
    <Card
      sx={{
        height: "95%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 1,
        overflow: "hidden",
        transition:
          ".15s ease",

        "&:hover": {
          transform:
            "translateY(-3px)",
          boxShadow: 3,
        },
      }}
    >
      <Link
        href={productUrl}
        style={{
          display: "block",
          color: "inherit",
          textDecoration: "none",
        }}
      >
        <Box
          sx={{
            position: "relative",
            aspectRatio:
              "1 / .5",

            bgcolor:
              "action.hover",

            overflow:
              "hidden",
          }}
        >

          {image && (
            <Image
              src={image}
              alt={
                product.media?.[0]
                  ?.alt ||
                product.name
              }
              fill
              sizes="(max-width:720px) 50vw, (max-width:1050px) 33vw, 25vw"
              style={{ objectFit: "cover" }}
            />
          )}

          {discounted && (
            <Chip
              label="Sale"
              color="error"
              size="small"
              sx={{
                position:
                  "absolute",
                top: 14,
                left: 14,
              }}
            />
          )}
        </Box>
      </Link>

      <CardContent
        sx={{
          display: "flex",
          flexDirection:
            "column",

          gap: 1.1,
          flex: 1,
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{
              lineHeight: 1.2,
            }}
          >
            {product.brand?.name ||
              "Aurelia"}
          </Typography>

          <Stack
            direction="row"
            spacing={.5}
            sx={{
              alignItems: "center",
            }}
          >

            <Typography
              fontWeight={900}
            >
              {product.currency ||
                "USD"}{" "}
              {Number(
                product.basePrice
              ).toFixed(2)}
            </Typography>

            {discounted && (
              <Typography
                variant="body2"
                color="text.disabled"
                sx={{
                  textDecoration:
                    "line-through",
                }}
              >
                {product.currency ||
                  "USD"}{" "}
                {Number(
                  product.compareAtPrice
                ).toFixed(2)}
              </Typography>
            )}
          </Stack>
        </Stack>

        <Stack
          direction="row"
          spacing={0.6}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href={productUrl}
            style={{
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                lineHeight: 1.2,
              }}
            >
              {product.name}
            </Typography>
          </Link>

          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              alignItems: "center",
            }}
          >
            <Rating
              value={Number(
                product.ratingAverage ||
                0
              )}
              precision={0.1}
              size="small"
              readOnly
            />

            <Typography
              variant="caption"
              color="text.secondary"
            >
              (
              {product.ratingCount ||
                0}
              )
            </Typography>
          </Stack>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            mt: "auto",
            pt: 1,
          }}
        >
          <AddToCartButton
            productId={String(
              product._id
            )}
            fullWidth
          />

          <Link
            href={productUrl}
            style={{
              textDecoration:
                "none",
            }}
          >
            <Button variant="outlined">
              View
            </Button>
          </Link>
        </Stack>
      </CardContent>
    </Card>
  );
}