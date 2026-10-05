import Link from "next/link";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";

import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import VerifiedUserOutlined from "@mui/icons-material/VerifiedUserOutlined";
import HeadsetMicOutlined from "@mui/icons-material/HeadsetMicOutlined";
import SpeedOutlined from "@mui/icons-material/SpeedOutlined";
import TrendingUpRounded from "@mui/icons-material/TrendingUpRounded";
import ShoppingBagRounded from "@mui/icons-material/ShoppingBagRounded";

import ProductCard from "@/components/storefront/ProductCard";

import { searchProducts } from "@/lib/commerce/catalog";
import { connectDB } from "@/lib/db";

import Category from "@/models/Category";
import SiteSetting from "@/models/SiteSetting";

export const revalidate = 60;


/* --------------------------------------------------
   DATA
-------------------------------------------------- */

async function products(params) {
  try {
    const result =
      await searchProducts(params);

    return Array.isArray(result?.items)
      ? result.items
      : [];
  } catch (error) {
    console.error(
      "[HomePage] Unable to load products:",
      error
    );

    return [];
  }
}

async function merchandising() {
  try {
    await connectDB();

    const [categories, banner] =
      await Promise.all([
        Category.find({
          $or: [
            {
              featured: true,
            },
            {
              trending: true,
            },
          ],
        })
          .sort({
            featured: -1,
            trending: -1,
            sortOrder: 1,
          })
          .limit(6)
          .lean(),

        SiteSetting.findOne({
          key: "homepage_banner",
          group: "marketing",
        })
          .select("value")
          .lean(),
      ]);

    return {
      categories: JSON.parse(
        JSON.stringify(
          categories || []
        )
      ),

      banner:
        banner?.value || null,
    };
  } catch (error) {
    console.error(
      "[HomePage] Unable to load merchandising:",
      error
    );

    return {
      categories: [],
      banner: null,
    };
  }
}

/* --------------------------------------------------
   SECTION HEADER
-------------------------------------------------- */

function SectionTitle({
  eyebrow,
  title,
  body,
  actionHref,
  actionText,
}) {
  return (
    <Stack
      sx={{
        mb: 4,

        flexDirection: {
          xs: "column",
          md: "row",
        },

        gap: 2,

        justifyContent:
          "space-between",

        alignItems: {
          xs: "flex-start",
          md: "flex-end",
        },
      }}
    >
      <Box>
        <Chip
          label={eyebrow}
          color="primary"
          variant="outlined"
          size="small"
        />

        <Typography
          variant="h3"
          sx={{
            mt: 1.5,
            maxWidth: 720,
          }}
        >
          {title}
        </Typography>
      </Box>

      <Stack
        sx={{
          gap: 1.5,

          alignItems: {
            xs: "flex-start",
            md: "flex-end",
          },
        }}
      >
        <Typography
          color="text.secondary"
          sx={{
            maxWidth: 460,

            textAlign: {
              xs: "left",
              md: "right",
            },
          }}
        >
          {body}
        </Typography>

        {actionHref &&
          actionText && (
            <Link
              href={actionHref}
              style={{
                textDecoration:
                  "none",
              }}
            >
              <Button
                endIcon={
                  <ArrowForwardRounded />
                }
              >
                {actionText}
              </Button>
            </Link>
          )}
      </Stack>
    </Stack>
  );
}

/* --------------------------------------------------
   PAGE
-------------------------------------------------- */

export default async function HomePage() {

  const [
    featured,
    trending,
    merch,
  ] = await Promise.all([
    products({
      limit: 8,
      sort: "featured",
      featured: "true",
    }),

    products({
      limit: 8,
      sort: "popular",
      trending: "true",
    }),

    merchandising(),
  ]);

  const categoryCards =
    merch.categories.length > 0
      ? merch.categories.slice(
        0,
        4
      )
      : [
        {
          slug: "",
          name: "New arrivals",
          description:
            "The latest additions to the collection.",
        },

        {
          slug: "",
          name: "Community picks",
          description:
            "Products customers return to.",
        },

        {
          slug: "",
          name:
            "Editor's choice",
          description:
            "A focused premium edit.",
        },

        {
          slug: "",
          name:
            "Everyday essentials",
          description:
            "Designed for daily use.",
        },
      ];

  const banner =
    merch.banner &&
      typeof merch.banner ===
      "object"
      ? merch.banner
      : null;

  const categoryFallback = [
    "/shop?sort=newest",
    "/shop?sort=popular",
    "/shop?featured=true",
    "/shop",
  ];

  return (
    <Box
      sx={{
        overflow:
          "hidden",
      }}
    >
      {/* ==================================================
          HERO
      ================================================== */}

      <Box
        sx={{
          py: {
            xs: 7,
            md: 10,
          },

          background: `
            radial-gradient(
              circle at 75% 20%,
              color-mix(
                in srgb,
                var(--mui-palette-primary-main) 16%,
                transparent
              ),
              transparent 36%
            ),
            linear-gradient(
              180deg,
              var(--mui-palette-background-paper),
              var(--mui-palette-background-default)
            )
          `,
        }}
      >
        <Container maxWidth="xl">
          <Grid
            container
            spacing={5}
            sx={{
              alignItems:
                "center",
            }}
          >
            {/* Hero text */}
            <Grid
              size={{
                xs: 12,
                lg: 6,
              }}
            >
              <Chip
                icon={
                  <AutoAwesomeRounded />
                }
                label="A premium commerce experience"
                color="primary"
                variant="outlined"
              />

              <Typography
                variant="h1"
                sx={{
                  mt: 2,

                  fontSize: {
                    xs: "3rem",
                    sm: "4.2rem",
                    lg: "5.5rem",
                  },

                  lineHeight:
                    0.96,

                  maxWidth: 800,
                }}
              >
                Beautiful
                essentials.{" "}

                <Box
                  component="span"
                  sx={{
                    color:
                      "primary.main",
                  }}
                >
                  Remarkably
                  simple
                </Box>{" "}

                shopping.
              </Typography>

              <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                  mt: 3,
                  maxWidth: 650,

                  fontWeight:
                    500,

                  lineHeight:
                    1.7,
                }}
              >
                Discover a
                sharper edit of
                design-led
                products in a
                storefront built
                with the same
                clarity, polish
                and confidence as
                a modern premium
                dashboard.
              </Typography>

              <Stack
                sx={{
                  mt: 4,

                  flexDirection: {
                    xs: "column",
                    sm: "row",
                  },

                  gap: 1.5,

                  alignItems: {
                    xs: "stretch",
                    sm: "center",
                  },
                }}
              >
                <Link
                  href="/shop"
                  style={{
                    textDecoration:
                      "none",
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={
                      <ArrowForwardRounded />
                    }
                    sx={{
                      width: {
                        xs: "100%",
                        sm: "auto",
                      },
                    }}
                  >
                    Shop the
                    collection
                  </Button>
                </Link>

                <Link
                  href="/shop?sort=newest"
                  style={{
                    textDecoration:
                      "none",
                  }}
                >
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      width: {
                        xs: "100%",
                        sm: "auto",
                      },
                    }}
                  >
                    Explore new
                    arrivals
                  </Button>
                </Link>
              </Stack>

              <Stack
                divider={
                  <Divider
                    orientation="vertical"
                    flexItem
                  />
                }
                sx={{
                  mt: 5,

                  flexDirection:
                    "row",

                  gap: 2.5,
                }}
              >
                <Box>
                  <Typography variant="h5">
                    100%
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Secure
                    checkout
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h5">
                    30 days
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Easy returns
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h5">
                    24/7
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Order access
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            {/* Hero analytics panel */}
            <Grid
              size={{
                xs: 12,
                lg: 6,
              }}
            >
              <Paper
                sx={{
                  p: {
                    xs: 0.5,
                    sm: 1.7,
                  },
                  width: { xs: "100%" },
                  borderRadius: 1,

                  position:
                    "relative",

                  overflow:
                    "hidden",

                  boxShadow: { xs: 1, md: 2 },
                }}
              >
                <Box
                  sx={{
                    position:
                      "absolute",

                    inset: 0,

                    background:
                      "linear-gradient(145deg, rgba(79,124,255,.12), transparent 48%)",

                    pointerEvents:
                      "none",
                  }}
                />

                <Stack
                  sx={{
                    position:
                      "relative",

                    flexDirection:
                      "row",

                    justifyContent:
                      "space-between",

                    alignItems:
                      "center",

                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="overline"
                      color="text.secondary"
                    >
                      Curated
                      commerce
                    </Typography>

                    <Typography variant="h5">
                      Today&apos;s
                      edit
                    </Typography>
                  </Box>

                  <Chip
                    label="Live collection"
                    color="success"
                    size="small"
                  />
                </Stack>

                <Grid
                  container
                  spacing={2}
                  sx={{
                    mt: 1,
                    position:
                      "relative",
                  }}
                >
                  {[
                    {
                      icon:
                        ShoppingBagRounded,

                      label:
                        "Premium picks",

                      value:
                        "08",

                      color:
                        "primary",
                    },

                    {
                      icon:
                        TrendingUpRounded,

                      label:
                        "Trending",

                      value:
                        "24",

                      color:
                        "warning",
                    },

                    {
                      icon:
                        VerifiedUserOutlined,

                      label:
                        "Verified",

                      value:
                        "100%",

                      color:
                        "success",
                    },
                  ].map(
                    (item) => {
                 
                      const Icon =
                        item.icon;

                      return (
                        <Grid
                          key={
                            item.label
                          }
                          size={{
                            xs: 12,
                            sm: 4,
                          }}
                        >
                          <Card
                            sx={{
                              borderRadius:
                                1,

                              height:
                                "100%",
                            }}
                          >
                            <CardContent>
                              <Avatar
                                sx={{
                                  bgcolor:
                                    `${item.color}.main`,

                                  mb: 2,
                                }}
                              >
                                <Icon />
                              </Avatar>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {
                                  item.label
                                }
                              </Typography>

                              <Typography variant="h5">
                                {
                                  item.value
                                }
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    }
                  )}
                </Grid>

                <Paper
                  sx={{
                    mt: 2,
                    p: 2.5,

                    borderRadius:
                      1.5,

                    bgcolor:
                      "primary.main",

                    color:
                      "primary.contrastText",
                  }}
                >
                  <Stack
                    sx={{
                      flexDirection:
                        "row",

                      justifyContent:
                        "space-between",

                      alignItems:
                        "center",

                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="overline"
                        sx={{
                          opacity:
                            0.72,
                        }}
                      >
                        Experience
                        score
                      </Typography>

                      <Typography variant="h4">
                        Fast, clear,
                        confident.
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          opacity:
                            0.78,

                          mt: 0.6,
                        }}
                      >
                        Built around
                        discovery,
                        trustworthy
                        product detail
                        and
                        friction-light
                        checkout.
                      </Typography>
                    </Box>

                    <Avatar
                      sx={{
                        width: 58,
                        height: 58,

                        flexShrink: 0,

                        bgcolor:
                          "rgba(255,255,255,.17)",
                      }}
                    >
                      <SpeedOutlined />
                    </Avatar>
                  </Stack>
                </Paper>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ==================================================
          TRUST STRIP
      ================================================== */}

      <Container
        maxWidth="xl"
        sx={{
          mt: -2,
        }}
      >
        <Paper
          sx={{
            p: 2,
            borderRadius:
              1,
          }}
        >
          <Grid
            container
            spacing={1}
          >
            {[
              [
                VerifiedUserOutlined,
                "Secure verified payments",
              ],

              [
                LocalShippingOutlined,
                "Complimentary delivery over $100",
              ],

              [
                HeadsetMicOutlined,
                "Responsive support",
              ],

              [
                SpeedOutlined,
                "Performance first",
              ],
            ].map(
              ([
                Icon,
                label,
              ]) => (
                <Grid
                  key={label}
                  size={{
                    xs: 12,
                    sm: 6,
                    lg: 3,
                  }}
                >
                  <Stack
                    sx={{
                      p: 1.2,

                      flexDirection:
                        "row",

                      gap: 1.5,

                      alignItems:
                        "center",
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 38,
                        height: 38,

                        bgcolor:
                          "primary.main",
                      }}
                    >
                      <Icon fontSize="small" />
                    </Avatar>

                    <Typography
                      variant="body2"
                      fontWeight={
                        800
                      }
                    >
                      {label}
                    </Typography>
                  </Stack>
                </Grid>
              )
            )}
          </Grid>
        </Paper>
      </Container>

      {/* ==================================================
          PROMOTION
      ================================================== */}

      {banner && (
        <Container
          maxWidth="xl"
          sx={{
            py: 7,
          }}
        >
          <Paper
            sx={{
              p: {
                xs: 3,
                md: 5,
              },

              borderRadius:
                4,

              background: `
                linear-gradient(
                  135deg,
                  color-mix(
                    in srgb,
                    var(--mui-palette-primary-main) 10%,
                    var(--mui-palette-background-paper)
                  ),
                  var(--mui-palette-background-paper)
                )
              `,
            }}
          >
            <Chip
              label={
                banner.eyebrow ||
                "Featured promotion"
              }
              color="primary"
            />

            <Typography
              variant="h3"
              sx={{
                mt: 2,
                maxWidth: 780,
              }}
            >
              {banner.title ||
                "A limited-time edit."}
            </Typography>

            {banner.body && (
              <Typography
                color="text.secondary"
                sx={{
                  mt: 1.5,
                  maxWidth: 700,
                }}
              >
                {
                  banner.body
                }
              </Typography>
            )}

            <Box
              sx={{
                mt: 3,
              }}
            >
              <Link
                href={
                  banner.href ||
                  "/shop"
                }
                style={{
                  textDecoration:
                    "none",
                }}
              >
                <Button variant="contained">
                  {banner.cta ||
                    "Shop now"}
                </Button>
              </Link>
            </Box>
          </Paper>
        </Container>
      )}

      {/* ==================================================
          FEATURED
      ================================================== */}

      <Container
        maxWidth="xl"
        sx={{
          py: 8,
        }}
      >
        <SectionTitle
          eyebrow="Featured edit"
          title="Designed to be used every day."
          body="Thoughtful products presented with clear information, strong visual hierarchy and effortless purchasing."
          actionHref="/shop?featured=true"
          actionText="View featured"
        />

        {featured.length >
          0 ? (
          <Grid
            container
            spacing={2}
          >
            {featured.map(
              (product) => (
                <Grid
                  key={String(
                    product._id
                  )}
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                    xl: 3,
                  }}
                >
                  <ProductCard
                    product={
                      product
                    }
                  />
                </Grid>
              )
            )}
          </Grid>
        ) : (
          <Paper
            sx={{
              p: 5,

              textAlign:
                "center",

              borderRadius:
                4,
            }}
          >
            <Typography variant="h4">
              Your catalog is
              ready.
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 1,
              }}
            >
              Publish featured
              products from the
              admin catalog.
            </Typography>

            <Box
              sx={{
                mt: 2,
              }}
            >
              <Link
                href="/admin/products"
                style={{
                  textDecoration:
                    "none",
                }}
              >
                <Button variant="contained">
                  Open product
                  manager
                </Button>
              </Link>
            </Box>
          </Paper>
        )}
      </Container>

      {/* ==================================================
          CATEGORIES
      ================================================== */}

      <Box
        sx={{
          py: 8,

          bgcolor:
            "background.default",

          borderTop:
            "1px solid",

          borderBottom:
            "1px solid",

          borderColor:
            "divider",
        }}
      >
        <Container maxWidth="xl">
          <SectionTitle
            eyebrow="Featured categories"
            title="Find your next direction."
            body="Browse purposeful collections with an editorial, dashboard-inspired visual system."
            actionHref="/shop"
            actionText="All categories"
          />

          <Grid
            container
            spacing={2}
          >
            {categoryCards.map(
              (
                category,
                index
              ) => {
                const href =
                  category.slug
                    ? `/category/${category.slug}`
                    : categoryFallback[
                    index
                    ];

                return (
                  <Grid
                    key={
                      category.slug ||
                      index
                    }
                    size={{
                      xs: 12,
                      sm: 6,
                      lg: 3,
                    }}
                  >
                    <Link
                      href={href}
                      style={{
                        display:
                          "block",

                        height:
                          "100%",

                        color:
                          "inherit",

                        textDecoration:
                          "none",
                      }}
                    >
                      <Card
                        sx={{
                          height:
                            "100%",

                          borderRadius:
                            1,

                          transition:
                            "transform .25s ease, box-shadow .25s ease",

                          "&:hover":
                          {
                            transform:
                              "translateY(-5px)",

                            boxShadow:
                              5,
                          },
                        }}
                      >
                        <CardContent
                          sx={{
                            p: 3,
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor:
                                index %
                                  2
                                  ? "warning.main"
                                  : "primary.main",

                              mb: 4,
                            }}
                          >
                            {String(
                              index +
                              1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </Avatar>

                          <Typography variant="h5">
                            {
                              category.name
                            }
                          </Typography>

                          <Typography
                            color="text.secondary"
                            sx={{
                              mt: 1,
                            }}
                          >
                            {category.description?.slice(
                              0,
                              30
                            ) ||
                              "Explore this collection."}
                          </Typography>

                          <Button
                            size="small"
                            endIcon={
                              <ArrowForwardRounded />
                            }
                            sx={{
                              mt: 2,
                              px: 0,

                              pointerEvents:
                                "none",
                            }}
                          >
                            Explore
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  </Grid>
                );
              }
            )}
          </Grid>
        </Container>
      </Box>

      {/* ==================================================
          TRENDING
      ================================================== */}

      <Container
        maxWidth="xl"
        sx={{
          py: 8,
        }}
      >
        <SectionTitle
          eyebrow="Trending now"
          title="What everyone is looking at."
          body="Popular products, live demand and the pieces customers keep coming back to."
          actionHref="/shop?sort=popular"
          actionText="View trending"
        />

        {trending.length >
          0 ? (
          <Grid
            container
            spacing={2}
          >
            {trending.map(
              (product) => (
                <Grid
                  key={String(
                    product._id
                  )}
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                    xl: 3,
                  }}
                >
                  <ProductCard
                    product={
                      product
                    }
                  />
                </Grid>
              )
            )}
          </Grid>
        ) : (
          <Paper
            sx={{
              p: 4,

              borderRadius:
                4,
            }}
          >
            <Typography color="text.secondary">
              Mark products as
              trending in the
              admin catalog to
              populate this
              section.
            </Typography>
          </Paper>
        )}
      </Container>

      {/* ==================================================
          FINAL CTA
      ================================================== */}

      <Container
        maxWidth="xl"
        sx={{
          pb: 9,
        }}
      >
        <Paper
          sx={{
            borderRadius: 2,

            p: {
              xs: 3,
              md: 5,
            },

            bgcolor:
              "#4F7CFF",

            color: "#fff",

            overflow:
              "hidden",

            position:
              "relative",
          }}
        >
          <Box
            sx={{
              position:
                "absolute",

              width: 340,
              height: 340,

              borderRadius:
                "50%",

              bgcolor:
                "rgba(255,255,255,.09)",

              right: -100,
              top: -120,

              pointerEvents:
                "none",
            }}
          />

          <Grid
            container
            spacing={3}
            sx={{
              position:
                "relative",

              zIndex: 1,

              alignItems:
                "center",
            }}
          >
            <Grid
              size={{
                xs: 12,
                md: 8,
              }}
            >
              <Typography variant="h3">
                A storefront that
                feels as polished
                as the products
                it sells.
              </Typography>

              <Typography
                sx={{
                  mt: 1.5,
                  opacity: 0.8,
                  maxWidth: 700,
                }}
              >
                Premium design,
                clear information
                and fast
                interactions
                across shopping,
                account
                management and
                administration.
              </Typography>
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <Stack
                sx={{
                  flexDirection: {
                    xs: "column",
                    sm: "row",
                    md: "column",
                  },

                  gap: 1.2,
                }}
              >
                <Link
                  href="/shop"
                  style={{
                    display:
                      "block",

                    width:
                      "100%",

                    textDecoration:
                      "none",
                  }}
                >
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor:
                        "#fff",

                      color:
                        "#24345B",

                      "&:hover":
                      {
                        bgcolor:
                          "#F3F6FF",
                      },
                    }}
                  >
                    Shop now
                  </Button>
                </Link>

                <Link
                  href="/support"
                  style={{
                    display:
                      "block",

                    width:
                      "100%",

                    textDecoration:
                      "none",
                  }}
                >
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      borderColor:
                        "rgba(255,255,255,.5)",

                      color:
                        "#fff",

                      "&:hover":
                      {
                        borderColor:
                          "#fff",

                        bgcolor:
                          "rgba(255,255,255,.08)",
                      },
                    }}
                  >
                    Talk to
                    support
                  </Button>
                </Link>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}