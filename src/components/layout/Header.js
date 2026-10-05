// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Link from "@/components/navigation/ClientLink";
// import { useSession } from "next-auth/react";
// import AppBar from "@mui/material/AppBar";
// import Toolbar from "@mui/material/Toolbar";
// import Box from "@mui/material/Box";
// import Container from "@mui/material/Container";
// import Typography from "@mui/material/Typography";
// import Button from "@mui/material/Button";
// import IconButton from "@mui/material/IconButton";
// import Badge from "@mui/material/Badge";
// import Drawer from "@mui/material/Drawer";
// import List from "@mui/material/List";
// import ListItemButton from "@mui/material/ListItemButton";
// import ListItemIcon from "@mui/material/ListItemIcon";
// import ListItemText from "@mui/material/ListItemText";
// import Divider from "@mui/material/Divider";
// import Menu from "@mui/material/Menu";
// import MenuItem from "@mui/material/MenuItem";
// import Paper from "@mui/material/Paper";
// import Stack from "@mui/material/Stack";
// import Chip from "@mui/material/Chip";
// import SearchRounded from "@mui/icons-material/SearchRounded";
// import PersonOutlineRounded from "@mui/icons-material/PersonOutlineRounded";
// import FavoriteBorderRounded from "@mui/icons-material/FavoriteBorderRounded";
// import ShoppingBagOutlined from "@mui/icons-material/ShoppingBagOutlined";
// import NotificationsNoneRounded from "@mui/icons-material/NotificationsNoneRounded";
// import MenuRounded from "@mui/icons-material/MenuRounded";
// import CloseRounded from "@mui/icons-material/CloseRounded";
// import AdminPanelSettingsRounded from "@mui/icons-material/AdminPanelSettingsRounded";
// import StorefrontRounded from "@mui/icons-material/StorefrontRounded";
// import LocalFireDepartmentRounded from "@mui/icons-material/LocalFireDepartmentRounded";
// import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
// import SupportAgentRounded from "@mui/icons-material/SupportAgentRounded";
// import ColorModeToggle from "@/components/layout/ColorModeToggle";
// import { useUiStore } from "@/store/ui";

// export default function Header() {
//   const { data: session } = useSession();
//   const [categories, setCategories] = useState([]);
//   const [brands, setBrands] = useState([]);
//   const [unread, setUnread] = useState(0);
//   const [announcement, setAnnouncement] = useState("Complimentary standard delivery over $100 · Secure checkout");
//   const [shopAnchor, setShopAnchor] = useState(null);

//   const openSearch = useUiStore((s) => s.openSearch);
//   const mobileMenuOpen = useUiStore((s) => s.mobileMenuOpen);
//   const toggleMenu = useUiStore((s) => s.toggleMenu);
//   const closeMenu = useUiStore((s) => s.closeMenu);
//   const cartCount = useUiStore((s) => s.cartCount);
//   const setCartCount = useUiStore((s) => s.setCartCount);

//   const isAdmin = session?.user?.role === "admin" || session?.user?.permissions?.includes("*");

//   useEffect(() => {
//     let cancelled = false;
//     async function loadHeader() {
//       try {
//         const [c, b, cart, config] = await Promise.all([
//           fetch("/api/catalog/categories").then((r) => r.json()),
//           fetch("/api/catalog/brands").then((r) => r.json()),
//           fetch("/api/cart").then((r) => r.json()),
//           fetch("/api/config/public").then((r) => r.json()),
//         ]);
//         if (cancelled) return;
//         setCategories(c.items || []);
//         setBrands(b.items || []);
//         setCartCount((cart.cart?.items || []).reduce((n, item) => n + item.quantity, 0));
//         const a = config.settings?.homepage_announcement;
//         if (a) setAnnouncement(typeof a === "string" ? a : a.text || announcement);
//       } catch { }
//     }
//     loadHeader();
//     return () => { cancelled = true; };
//   }, [setCartCount]);

//   useEffect(() => {
//     let cancelled = false;
//     if (!session?.user?.id) {
//       setUnread(0);
//       return;
//     }
//     fetch("/api/account/notifications")
//       .then((r) => r.json())
//       .then((d) => { if (!cancelled) setUnread(d.unread || 0); })
//       .catch(() => { });
//     return () => { cancelled = true; };
//   }, [session?.user?.id]);

//   const roots = useMemo(() => categories.filter((c) => !c.parent).slice(0, 8), [categories]);
//   const featuredBrands = useMemo(() => brands.filter((b) => b.featured).slice(0, 6), [brands]);

//   const actionSx = {
//     color: "text.primary",
//     bgcolor: "action.hover",
//     border: 1,
//     borderColor: "divider",
//     "&:hover": { bgcolor: "primary.main", color: "primary.contrastText", borderColor: "primary.main" },
//   };

//   return (
//     <>
//       <Box sx={{ bgcolor: "#4F7CFF", color: "#fff", py: .8, textAlign: "center" }}>
//         <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: ".04em" }}>{announcement}</Typography>
//       </Box>

//       <AppBar position="sticky" elevation={0} color="transparent" sx={{ backdropFilter: "blur(18px)", bgcolor: (t) => t.palette.mode === "dark" ? "rgba(11,16,32,.86)" : "rgba(255,255,255,.88)", borderBottom: 1, borderColor: "divider" }}>
//         <Container >
//           <Toolbar disableGutters sx={{ minHeight: { xs: 68, md: 78 }, gap: 2, border: "2px sloid red" }}>
//             <IconButton onClick={toggleMenu} sx={{ display: { md: "none" }, ...actionSx }} aria-label="Open menu">
//               {mobileMenuOpen ? <CloseRounded /> : <MenuRounded />}
//             </IconButton>

//             <Typography component={Link} href="/" variant="h5" sx={{ fontWeight: 900, letterSpacing: "-.04em", mr: { xs: "auto", md: 2 } }}>
//               AURELIA<Typography component="span" color="primary.main" sx={{ fontWeight: 900 }}>.</Typography>
//             </Typography>

//             <Stack direction="row" spacing={.5} sx={{ display: { xs: "none", md: "flex" }, flex: 1 }}>
//               <Button component={Link} href="/shop?sort=newest" color="inherit" startIcon={<AutoAwesomeRounded />}>New arrivals</Button>
//               <Button color="inherit" startIcon={<StorefrontRounded />} onClick={(e) => setShopAnchor(e.currentTarget)}>Shop</Button>
//               <Button component={Link} href="/shop?sort=popular" color="inherit" startIcon={<LocalFireDepartmentRounded />}>Trending</Button>
//               <Button component={Link} href="/shop?featured=true" color="inherit">Featured</Button>
//               {isAdmin && (
//                 <Button component={Link} href="/admin" variant="contained" startIcon={<AdminPanelSettingsRounded />} sx={{ ml: 1 }}>Admin</Button>
//               )}
//             </Stack>

//             <Stack
//               direction="row"
//               spacing={0.8}
//               sx={{
//                 alignItems: "center"
//               }}
//             >
//               <ColorModeToggle />
//               <IconButton onClick={openSearch} sx={actionSx} aria-label="Search">
//                 <SearchRounded />
//               </IconButton>
//               <IconButton component={Link} href="/wishlist" sx={{ ...actionSx, display: { xs: "none", sm: "inline-flex" } }} aria-label="Wishlist">
//                 <FavoriteBorderRounded />
//               </IconButton>
//               <IconButton component={Link} href={session ? "/account/notifications" : "/login"} sx={{ ...actionSx, display: { xs: "none", sm: "inline-flex" } }} aria-label="Notifications">
//                 <Badge badgeContent={unread} color="error" max={99}>
//                   <NotificationsNoneRounded />
//                 </Badge>
//               </IconButton>
//               <IconButton component={Link} href={session ? "/account" : "/login"} sx={{ ...actionSx, display: { xs: "none", md:"inline-flex" } }} aria-label="Account">
//                 <PersonOutlineRounded />
//               </IconButton>
//               <IconButton component={Link} href="/cart" sx={actionSx} aria-label="Cart">
//                 <Badge badgeContent={cartCount} color="primary" max={99}>
//                   <ShoppingBagOutlined />
//                 </Badge>
//               </IconButton>
//             </Stack>
//           </Toolbar>
//         </Container>
//       </AppBar>

//       <Menu anchorEl={shopAnchor} open={Boolean(shopAnchor)} onClose={() => setShopAnchor(null)}>
//         <Box sx={{ p: 1.5 }}>
//           <Typography variant="overline" color="text.secondary">Shop by collection</Typography>
//           <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 1, mt: 1 }}>
//             {roots.map((cat) => (
//               <MenuItem key={cat._id} component={Link} href={`/category/${cat.slug}`} onClick={() => setShopAnchor(null)} sx={{ borderRadius: 2 }}>
//                 <ListItemText primary={cat.name} secondary={cat.description?.slice(0, 44)} />
//               </MenuItem>
//             ))}
//           </Box>
//           {featuredBrands.length > 0 && (
//             <>
//               <Divider sx={{ my: 2 }} />
//               <Stack
//                 direction="row"
//                 sx={{
//                   gap: 1,
//                   flexWrap: "wrap",
//                 }}
//               >
//                 {featuredBrands.map((brand) => <Chip key={brand._id} label={brand.name} component={Link} href={`/shop?brandSlug=${brand.slug}`} clickable />)}
//               </Stack>
//             </>
//           )}
//         </Box>
//       </Menu>

//       <Drawer anchor="left" open={mobileMenuOpen} onClose={closeMenu} PaperProps={{ sx: { width: 310, p: 2 } }}>
//         <Stack
//           direction="row"
//           sx={{
//             justifyContent: "space-between",
//             alignItems: "center",
//             mb: 1,
//           }}
//         >
//           <Typography variant="h6" fontWeight={900}>AURELIA.</Typography>
//           <IconButton onClick={closeMenu}><CloseRounded /></IconButton>
//         </Stack>
//         <Divider />
//         <List>
//           <ListItemButton component={Link} href="/shop" onClick={closeMenu}><ListItemIcon><StorefrontRounded /></ListItemIcon><ListItemText primary="Shop all" /></ListItemButton>
//           <ListItemButton component={Link} href="/shop?sort=popular" onClick={closeMenu}><ListItemIcon><LocalFireDepartmentRounded /></ListItemIcon><ListItemText primary="Trending" /></ListItemButton>
//           {roots.map((cat) => <ListItemButton key={cat._id} component={Link} href={`/category/${cat.slug}`} onClick={closeMenu}><ListItemText inset primary={cat.name} /></ListItemButton>)}
//           <Divider sx={{ my: 1 }} />
//           <ListItemButton component={Link} href="/wishlist" onClick={closeMenu}><ListItemIcon><FavoriteBorderRounded /></ListItemIcon><ListItemText primary="Wishlist" /></ListItemButton>
//           <ListItemButton component={Link} href={session ? "/account" : "/login"} onClick={closeMenu}><ListItemIcon><PersonOutlineRounded /></ListItemIcon><ListItemText primary={session ? "My account" : "Sign in"} /></ListItemButton>
//           <ListItemButton component={Link} href="/support" onClick={closeMenu}><ListItemIcon><SupportAgentRounded /></ListItemIcon><ListItemText primary="Support" /></ListItemButton>
//           {isAdmin && <ListItemButton component={Link} href="/admin" onClick={closeMenu} sx={{ mt: 1, bgcolor: "primary.main", color: "primary.contrastText", borderRadius: 2 }}><ListItemIcon sx={{ color: "inherit" }}><AdminPanelSettingsRounded /></ListItemIcon><ListItemText primary="Admin control" /></ListItemButton>}
//         </List>
//       </Drawer>
//     </>
//   );
// }


"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "@/components/navigation/ClientLink";

import { useSession } from "next-auth/react";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";

import SearchRounded from "@mui/icons-material/SearchRounded";
import PersonOutlineRounded from "@mui/icons-material/PersonOutlineRounded";
import FavoriteBorderRounded from "@mui/icons-material/FavoriteBorderRounded";
import ShoppingBagOutlined from "@mui/icons-material/ShoppingBagOutlined";
import NotificationsNoneRounded from "@mui/icons-material/NotificationsNoneRounded";
import MenuRounded from "@mui/icons-material/MenuRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import AdminPanelSettingsRounded from "@mui/icons-material/AdminPanelSettingsRounded";
import StorefrontRounded from "@mui/icons-material/StorefrontRounded";
import LocalFireDepartmentRounded from "@mui/icons-material/LocalFireDepartmentRounded";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import SupportAgentRounded from "@mui/icons-material/SupportAgentRounded";

import ColorModeToggle from "@/components/layout/ColorModeToggle";

import { useUiStore } from "@/store/ui";

export default function Header() {
  const {
    data: session,
  } = useSession();

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    brands,
    setBrands,
  ] = useState([]);

  const [
    unread,
    setUnread,
  ] = useState(0);

  const [
    announcement,
    setAnnouncement,
  ] = useState(
    "Complimentary standard delivery over $100 · Secure checkout"
  );

  const [
    shopAnchor,
    setShopAnchor,
  ] = useState(null);

  const openSearch =
    useUiStore(
      (state) =>
        state.openSearch
    );

  const mobileMenuOpen =
    useUiStore(
      (state) =>
        state.mobileMenuOpen
    );

  const toggleMenu =
    useUiStore(
      (state) =>
        state.toggleMenu
    );

  const closeMenu =
    useUiStore(
      (state) =>
        state.closeMenu
    );

  const cartCount =
    useUiStore(
      (state) =>
        state.cartCount
    );

  const setCartCount =
    useUiStore(
      (state) =>
        state.setCartCount
    );

  const isAdmin =
    session?.user?.role ===
    "admin" ||
    session?.user?.permissions?.includes(
      "*"
    );

  /*
   * ----------------------------------
   * HEADER DATA
   * ----------------------------------
   */
  useEffect(() => {
    let cancelled =
      false;

    async function loadHeader() {
      try {
        const [
          categoriesResponse,
          brandsResponse,
          cartResponse,
          configResponse,
        ] =
          await Promise.all([
            fetch(
              "/api/catalog/categories",
              {
                cache:
                  "no-store",
              }
            ),

            fetch(
              "/api/catalog/brands",
              {
                cache:
                  "no-store",
              }
            ),

            fetch(
              "/api/cart",
              {
                cache:
                  "no-store",
              }
            ),

            fetch(
              "/api/config/public",
              {
                cache:
                  "no-store",
              }
            ),
          ]);

        const [
          categoriesData,
          brandsData,
          cartData,
          configData,
        ] =
          await Promise.all([
            categoriesResponse
              .ok
              ? categoriesResponse.json()
              : Promise.resolve(
                {}
              ),

            brandsResponse.ok
              ? brandsResponse.json()
              : Promise.resolve(
                {}
              ),

            cartResponse.ok
              ? cartResponse.json()
              : Promise.resolve(
                {}
              ),

            configResponse.ok
              ? configResponse.json()
              : Promise.resolve(
                {}
              ),
          ]);

        if (cancelled) {
          return;
        }

        setCategories(
          Array.isArray(
            categoriesData?.items
          )
            ? categoriesData.items
            : []
        );

        setBrands(
          Array.isArray(
            brandsData?.items
          )
            ? brandsData.items
            : []
        );

        const cartItems =
          Array.isArray(
            cartData?.cart
              ?.items
          )
            ? cartData.cart
              .items
            : [];

        const count =
          cartItems.reduce(
            (
              total,
              item
            ) =>
              total +
              Number(
                item?.quantity ||
                0
              ),
            0
          );

        setCartCount(count);

        const configuredAnnouncement =
          configData
            ?.settings
            ?.homepage_announcement;

        if (
          configuredAnnouncement
        ) {
          if (
            typeof configuredAnnouncement ===
            "string"
          ) {
            setAnnouncement(
              configuredAnnouncement
            );
          } else if (
            configuredAnnouncement
              ?.text
          ) {
            setAnnouncement(
              configuredAnnouncement.text
            );
          }
        }
      } catch (error) {
        console.error(
          "[Header] Unable to load header data:",
          error
        );
      }
    }

    loadHeader();

    return () => {
      cancelled =
        true;
    };
  }, [setCartCount]);

  /*
   * ----------------------------------
   * NOTIFICATIONS
   * ----------------------------------
   */
  useEffect(() => {
    let cancelled =
      false;

    if (
      !session?.user?.id
    ) {
      setUnread(0);
      return undefined;
    }

    async function loadNotifications() {
      try {
        const response =
          await fetch(
            "/api/account/notifications",
            {
              cache:
                "no-store",
            }
          );

        if (
          !response.ok
        ) {
          return;
        }

        const data =
          await response.json();

        if (!cancelled) {
          setUnread(
            Number(
              data?.unread ||
              0
            )
          );
        }
      } catch {
        // Intentionally silent.
      }
    }

    loadNotifications();

    return () => {
      cancelled =
        true;
    };
  }, [
    session?.user?.id,
  ]);

  /*
   * ----------------------------------
   * DERIVED DATA
   * ----------------------------------
   */
  const roots =
    useMemo(
      () =>
        categories
          .filter(
            (category) =>
              !category.parent
          )
          .slice(0, 8),
      [categories]
    );

  const featuredBrands =
    useMemo(
      () =>
        brands
          .filter(
            (brand) =>
              brand.featured
          )
          .slice(0, 6),
      [brands]
    );

  /*
   * ----------------------------------
   * SHARED ICON STYLE
   * ----------------------------------
   */
  const actionSx = {
    color:
      "text.primary",

    bgcolor:
      "action.hover",

    border: 1,

    borderColor:
      "divider",

    "&:hover": {
      bgcolor:
        "primary.main",

      color:
        "primary.contrastText",

      borderColor:
        "primary.main",
    },
  };

  function closeShopMenu() {
    setShopAnchor(null);
  }

  return (
    <>
      {/* Announcement */}
      <Box
        sx={{
          bgcolor:
            "#4F7CFF",

          color:
            "#FFFFFF",

          py: 0.8,

          px: 2,

          textAlign:
            "center",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight:
              700,

            letterSpacing:
              ".04em",
          }}
        >
          {announcement}
        </Typography>
      </Box>

      {/* Main navigation */}
      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        sx={{
          backdropFilter:
            "blur(18px)",

          WebkitBackdropFilter:
            "blur(18px)",

          bgcolor:
            "background.paper",

          backgroundImage:
            "none",

          borderBottom:
            1,

          borderColor:
            "divider",

          zIndex: (
            theme
          ) =>
            theme.zIndex
              .appBar,
        }}
      >
        <Container
          maxWidth="xl"
        >
          <Toolbar
            disableGutters
            sx={{
              minHeight: {
                xs: 68,
                md: 78,
              },

              gap: 2,
            }}
          >
            {/* Mobile menu */}
            <IconButton
              type="button"
              onClick={
                toggleMenu
              }
              aria-label="Open menu"
              sx={{
                ...actionSx,

                display: {
                  xs: "inline-flex",
                  md: "none",
                },
              }}
            >
              {mobileMenuOpen ? (
                <CloseRounded />
              ) : (
                <MenuRounded />
              )}
            </IconButton>

            {/* Brand */}
            <Typography
              component={
                Link
              }
              href="/"
              variant="h5"
              sx={{
                color:
                  "text.primary",

                textDecoration:
                  "none",

                fontWeight:
                  900,

                letterSpacing:
                  "-.04em",

                mr: {
                  xs: "auto",
                  md: 2,
                },
              }}
            >
              AURELIA

              <Typography
                component="span"
                sx={{
                  color:
                    "primary.main",

                  fontWeight:
                    900,
                }}
              >
                .
              </Typography>
            </Typography>

            {/* Desktop links */}
            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                display: {
                  xs: "none",
                  md: "flex",
                },

                alignItems:
                  "center",

                flex: 1,
              }}
            >
              <Button
                component={
                  Link
                }
                href="/shop?sort=newest"
                color="inherit"
                startIcon={
                  <AutoAwesomeRounded />
                }
              >
                New arrivals
              </Button>

              <Button
                color="inherit"
                startIcon={
                  <StorefrontRounded />
                }
                onClick={(
                  event
                ) =>
                  setShopAnchor(
                    event.currentTarget
                  )
                }
                aria-haspopup="menu"
                aria-expanded={
                  Boolean(
                    shopAnchor
                  )
                    ? "true"
                    : undefined
                }
              >
                Shop
              </Button>

              <Button
                component={
                  Link
                }
                href="/shop?sort=popular"
                color="inherit"
                startIcon={
                  <LocalFireDepartmentRounded />
                }
              >
                Trending
              </Button>

              <Button
                component={
                  Link
                }
                href="/shop?featured=true"
                color="inherit"
              >
                Featured
              </Button>

              {isAdmin && (
                <Button
                  component={
                    Link
                  }
                  href="/admin"
                  variant="contained"
                  startIcon={
                    <AdminPanelSettingsRounded />
                  }
                  sx={{
                    ml: 1,
                  }}
                >
                  Admin
                </Button>
              )}
            </Stack>

            {/* Right-side actions */}
            <Stack
              direction="row"
              spacing={0.8}
              sx={{
                alignItems:
                  "center",
              }}
            >
              <ColorModeToggle />

              <IconButton
                type="button"
                onClick={
                  openSearch
                }
                sx={
                  actionSx
                }
                aria-label="Search"
              >
                <SearchRounded />
              </IconButton>

              <IconButton
                component={
                  Link
                }
                href="/wishlist"
                aria-label="Wishlist"
                sx={{
                  ...actionSx,

                  display: {
                    xs: "none",
                    sm: "inline-flex",
                  },
                }}
              >
                <FavoriteBorderRounded />
              </IconButton>

              <IconButton
                component={
                  Link
                }
                href={
                  session
                    ? "/account/notifications"
                    : "/login"
                }
                aria-label="Notifications"
                sx={{
                  ...actionSx,

                  display: {
                    xs: "none",
                    sm: "inline-flex",
                  },
                }}
              >
                <Badge
                  badgeContent={
                    unread
                  }
                  color="error"
                  max={99}
                >
                  <NotificationsNoneRounded />
                </Badge>
              </IconButton>

              <IconButton
                component={
                  Link
                }
                href={
                  session
                    ? "/account"
                    : "/login"
                }
                aria-label="Account"
                sx={{
                  ...actionSx,

                  display: {
                    xs: "none",
                    md: "inline-flex",
                  },
                }}
              >
                <PersonOutlineRounded />
              </IconButton>

              <IconButton
                component={
                  Link
                }
                href="/cart"
                aria-label="Cart"
                sx={
                  actionSx
                }
              >
                <Badge
                  badgeContent={
                    cartCount
                  }
                  color="primary"
                  max={99}
                >
                  <ShoppingBagOutlined />
                </Badge>
              </IconButton>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Desktop shop menu */}
      <Menu
        anchorEl={
          shopAnchor
        }
        open={Boolean(
          shopAnchor
        )}
        onClose={
          closeShopMenu
        }
        slotProps={{
          paper: {
            sx: {
              mt: 1,

              minWidth:
                420,

              maxWidth:
                620,

              borderRadius:
                1,

              border:
                "1px solid",

              borderColor:
                "divider",

              boxShadow:
                8,

              backgroundImage:
                "none",
            },
          },
        }}
      >
        <Box
          sx={{
            p: 1.5,
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
          >
            Shop by
            collection
          </Typography>

          <Box
            sx={{
              display:
                "grid",

              gridTemplateColumns:
              {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
              },

              gap: 1,

              mt: 1,
            }}
          >
            {roots.map(
              (
                category
              ) => (
                <MenuItem
                  key={
                    category._id
                  }
                  component={
                    Link
                  }
                  href={`/category/${category.slug}`}
                  onClick={
                    closeShopMenu
                  }
                  sx={{
                    borderRadius:
                      1,

                    alignItems:
                      "flex-start",
                  }}
                >
                  <ListItemText
                    primary={
                      category.name
                    }
                    secondary={
                      category.description?.slice(
                        0,
                        30
                      ) ||
                      undefined
                    }
                  />
                </MenuItem>
              )
            )}
          </Box>

          {featuredBrands.length >
            0 && (
              <>
                <Divider
                  sx={{
                    my: 2,
                  }}
                />

                <Typography
                  variant="overline"
                  color="text.secondary"
                >
                  Featured brands
                </Typography>

                <Stack
                  direction="row"
                  sx={{
                    gap: 1,

                    flexWrap:
                      "wrap",

                    mt: 1,
                  }}
                >
                  {featuredBrands.map(
                    (
                      brand
                    ) => (
                      <Chip
                        key={
                          brand._id
                        }
                        label={
                          brand.name
                        }
                        component={
                          Link
                        }
                        href={`/shop?brandSlug=${brand.slug}`}
                        clickable
                        onClick={
                          closeShopMenu
                        }
                      />
                    )
                  )}
                </Stack>
              </>
            )}
        </Box>
      </Menu>

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={
          Boolean(
            mobileMenuOpen
          )
        }
        onClose={
          closeMenu
        }
        slotProps={{
          paper: {
            sx: {
              width: {
                xs: 290,
                sm: 320,
              },

              p: 2,

              bgcolor:
                "background.paper",

              backgroundImage:
                "none",
            },
          },
        }}
      >
        <Stack
          direction="row"
          sx={{
            justifyContent:
              "space-between",

            alignItems:
              "center",

            mb: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight:
                900,
            }}
          >
            AURELIA.
          </Typography>

          <IconButton
            type="button"
            onClick={
              closeMenu
            }
            aria-label="Close menu"
          >
            <CloseRounded />
          </IconButton>
        </Stack>

        <Divider />

        <List>
          <ListItemButton
            component={
              Link
            }
            href="/shop"
            onClick={
              closeMenu
            }
          >
            <ListItemIcon>
              <StorefrontRounded />
            </ListItemIcon>

            <ListItemText primary="Shop all" />
          </ListItemButton>

          <ListItemButton
            component={
              Link
            }
            href="/shop?sort=popular"
            onClick={
              closeMenu
            }
          >
            <ListItemIcon>
              <LocalFireDepartmentRounded />
            </ListItemIcon>

            <ListItemText primary="Trending" />
          </ListItemButton>

          {roots.map(
            (category) => (
              <ListItemButton
                key={
                  category._id
                }
                component={
                  Link
                }
                href={`/category/${category.slug}`}
                onClick={
                  closeMenu
                }
              >
                <ListItemText
                  inset
                  primary={
                    category.name
                  }
                />
              </ListItemButton>
            )
          )}

          <Divider
            sx={{
              my: 1,
            }}
          />

          <ListItemButton
            component={
              Link
            }
            href="/wishlist"
            onClick={
              closeMenu
            }
          >
            <ListItemIcon>
              <FavoriteBorderRounded />
            </ListItemIcon>

            <ListItemText primary="Wishlist" />
          </ListItemButton>

          <ListItemButton
            component={
              Link
            }
            href={
              session
                ? "/account"
                : "/login"
            }
            onClick={
              closeMenu
            }
          >
            <ListItemIcon>
              <PersonOutlineRounded />
            </ListItemIcon>

            <ListItemText
              primary={
                session
                  ? "My account"
                  : "Sign in"
              }
            />
          </ListItemButton>

          <ListItemButton
            component={
              Link
            }
            href="/support"
            onClick={
              closeMenu
            }
          >
            <ListItemIcon>
              <SupportAgentRounded />
            </ListItemIcon>

            <ListItemText primary="Support" />
          </ListItemButton>

          {isAdmin && (
            <ListItemButton
              component={
                Link
              }
              href="/admin"
              onClick={
                closeMenu
              }
              sx={{
                mt: 1,

                bgcolor:
                  "primary.main",

                color:
                  "primary.contrastText",

                borderRadius:
                  2,

                "&:hover":
                {
                  bgcolor:
                    "primary.dark",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    "inherit",
                }}
              >
                <AdminPanelSettingsRounded />
              </ListItemIcon>

              <ListItemText primary="Admin control" />
            </ListItemButton>
          )}
        </List>
      </Drawer>
    </>
  );
}