"use client";

import Link from "@/components/navigation/ClientLink";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";

export default function Footer() {
  const sections = [
    [
      "Shop",
      [
        ["All products", "/shop"],
        ["Search", "/search"],
        ["Wishlist", "/wishlist"],
      ],
    ],

    [
      "Account",
      [
        ["Dashboard", "/account"],
        ["Orders", "/account/orders"],
        ["Support", "/support"],
      ],
    ],

    [
      "Policies",
      [
        ["Shipping", "/shipping"],
        ["Returns", "/returns"],
        ["Privacy", "/privacy"],
        ["Terms", "/terms"],
      ],
    ],
  ];

  return (
    <Box
      component="footer"
      sx={{
        mt: 10,

        bgcolor: (theme) =>
          theme.palette.mode === "dark"
            ? "#080D18"
            : "#111827",

        color: "#fff",
        pt: 8,
        pb: 3,
      }}
    >
      <Container maxWidth="xl">
        <Grid
          container
          spacing={5}
        >
          <Grid
            size={{
              xs: 12,
              md: 5,
            }}
          >
            <Typography
              component={Link}
              href="/"
              variant="h4"
              fontWeight={900}
            >
              AURELIA

              <Typography
                component="span"
                color="primary.main"
                variant="h4"
                fontWeight={900}
              >
                .
              </Typography>
            </Typography>

            <Typography
              sx={{
                color:
                  "rgba(255,255,255,.68)",
                maxWidth: 430,
                mt: 2,
                lineHeight: 1.8,
              }}
            >
              Premium commerce, engineered
              for speed, clarity and a
              beautifully considered customer
              experience.
            </Typography>

            <Button
              component={Link}
              href="/shop"
              variant="contained"
              endIcon={
                <ArrowForwardRounded />
              }
              sx={{
                mt: 3,
              }}
            >
              Explore the collection
            </Button>
          </Grid>

          {sections.map(
            ([title, links]) => (
              <Grid
                key={title}
                size={{
                  xs: 6,
                  sm: 4,
                  md: 2.33,
                }}
              >
                <Typography
                  fontWeight={800}
                  sx={{
                    mb: 2,
                  }}
                >
                  {title}
                </Typography>

                <Stack spacing={1.4}>
                  {links.map(
                    ([label, href]) => (
                      <Typography
                        key={href}
                        component={Link}
                        href={href}
                        variant="body2"
                        sx={{
                          color:
                            "rgba(255,255,255,.68)",

                          "&:hover": {
                            color:
                              "#fff",
                          },
                        }}
                      >
                        {label}
                      </Typography>
                    )
                  )}
                </Stack>
              </Grid>
            )
          )}
        </Grid>

        <Divider
          sx={{
            my: 5,
            borderColor:
              "rgba(255,255,255,.10)",
          }}
        />

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
          sx={{
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color:
                "rgba(255,255,255,.5)",
            }}
          >
            © {new Date().getFullYear()}{" "}
            Aurelia Commerce
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color:
                "rgba(255,255,255,.5)",
            }}
          >
            Fast by design · Secure by
            default
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}