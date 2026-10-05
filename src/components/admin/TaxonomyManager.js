"use client";

import {
  MuiButton,
  MuiInput,
  MuiSelect,
  MuiTextarea,
} from "@/components/ui/MuiFormControls";

import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

import {
  alpha,
  useTheme,
} from "@mui/material/styles";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useToast } from "@/components/providers/ToastProvider";
import Loading from "@/components/ui/Loading";

/* =========================================================
   DEFAULT FORM
========================================================= */

const fresh = {
  name: "",
  slug: "",
  description: "",
  parent: "",
  featured: false,
  trending: false,
  banner: "",
  logo: "",
  sortOrder: 0,
  filters: [],

  seo: {
    title: "",
    description: "",
  },
};

/* =========================================================
   COMPONENT
========================================================= */

export default function TaxonomyManager({
  type,
}) {
  const theme = useTheme();

  const isDark =
    theme.palette.mode === "dark";

  const endpoint =
    `/api/admin/${type}`;

  const [items, setItems] =
    useState(null);

  const [form, setForm] =
    useState(fresh);

  const [editing, setEditing] =
    useState(null);

  const [
    filtersText,
    setFiltersText,
  ] = useState("[]");

  const [
    search,
    setSearch,
  ] = useState("");

  const { toast } = useToast();

  const singularLabel =
    type === "categories"
      ? "category"
      : type === "brands"
        ? "brand"
        : type.endsWith("s")
          ? type.slice(0, -1)
          : type;

  const pluralLabel =
    type === "categories"
      ? "categories"
      : type === "brands"
        ? "brands"
        : type;

  /* =========================================================
     LOAD
  ========================================================= */

  const load = () => {
    fetch(endpoint)
      .then((response) =>
        response.json()
      )
      .then((data) => {
        setItems(
          data.items || []
        );
      })
      .catch(() => {
        setItems([]);

        toast(
          `Unable to load ${pluralLabel}`,
          "error"
        );
      });
  };

  useEffect(() => {
    load();
  }, [endpoint]);

  /* =========================================================
     EDIT
  ========================================================= */

  function begin(item) {
    setEditing(item._id);

    const next = {
      ...fresh,
      ...item,

      parent:
        item.parent?._id ||
        item.parent ||
        "",

      seo: {
        ...fresh.seo,
        ...item.seo,
      },
    };

    setForm(next);

    setFiltersText(
      JSON.stringify(
        item.filters || [],
        null,
        2
      )
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =========================================================
     RESET
  ========================================================= */

  function reset() {
    setEditing(null);

    setForm({
      ...fresh,
      seo: {
        ...fresh.seo,
      },
    });

    setFiltersText("[]");
  }

  /* =========================================================
     SAVE
  ========================================================= */

  async function save(event) {
    event.preventDefault();

    let filters = [];

    if (
      type === "categories"
    ) {
      try {
        filters =
          JSON.parse(
            filtersText ||
            "[]"
          );

        if (
          !Array.isArray(
            filters
          )
        ) {
          return toast(
            "Category filters must be a JSON array",
            "error"
          );
        }
      } catch {
        return toast(
          "Category filters must be valid JSON",
          "error"
        );
      }
    }

    const payload = {
      ...form,

      ...(type ===
        "categories"
        ? {
          parent:
            form.parent ||
            null,

          sortOrder:
            Number(
              form.sortOrder ||
              0
            ),

          filters,
        }
        : {}),
    };

    try {
      const response =
        await fetch(
          endpoint,
          {
            method: editing
              ? "PATCH"
              : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                editing
                  ? {
                    id: editing,
                    ...payload,
                  }
                  : payload
              ),
          }
        );

      const data =
        await response.json();

      toast(
        response.ok
          ? `${singularLabel} ${editing
            ? "updated"
            : "created"
          }`
          : data.error ||
          "Unable to save",

        response.ok
          ? "success"
          : "error"
      );

      if (response.ok) {
        reset();
        load();
      }
    } catch {
      toast(
        "Unable to save",
        "error"
      );
    }
  }

  /* =========================================================
     DELETE
  ========================================================= */

  async function remove(id) {
    const confirmed =
      window.confirm(
        `Delete this ${singularLabel}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      const response =
        await fetch(
          `${endpoint}?id=${id}`,
          {
            method:
              "DELETE",
          }
        );

      const data =
        await response.json();

      toast(
        response.ok
          ? "Deleted"
          : data.error ||
          "Unable to delete",

        response.ok
          ? "success"
          : "error"
      );

      if (response.ok) {
        if (
          editing === id
        ) {
          reset();
        }

        load();
      }
    } catch {
      toast(
        "Unable to delete",
        "error"
      );
    }
  }

  /* =========================================================
     HELPERS
  ========================================================= */

  function getParentId(
    item
  ) {
    return (
      item.parent?._id ||
      item.parent ||
      null
    );
  }

  /* =========================================================
     ITEM MAP
  ========================================================= */

  const itemMap =
    useMemo(() => {
      if (!items) {
        return new Map();
      }

      return new Map(
        items.map(
          (item) => [
            String(
              item._id
            ),
            item,
          ]
        )
      );
    }, [items]);

  /* =========================================================
     CHILDREN MAP
  ========================================================= */

  const childrenMap =
    useMemo(() => {
      const map =
        new Map();

      if (!items) {
        return map;
      }

      items.forEach(
        (item) => {
          const parentId =
            getParentId(
              item
            );

          if (!parentId) {
            return;
          }

          const key =
            String(
              parentId
            );

          if (
            !map.has(key)
          ) {
            map.set(
              key,
              []
            );
          }

          map
            .get(key)
            .push(item);
        }
      );

      map.forEach(
        (children) => {
          children.sort(
            (a, b) => {
              const sortDifference =
                Number(
                  a.sortOrder ||
                  0
                ) -
                Number(
                  b.sortOrder ||
                  0
                );

              if (
                sortDifference !==
                0
              ) {
                return sortDifference;
              }

              return String(
                a.name || ""
              ).localeCompare(
                String(
                  b.name ||
                  ""
                )
              );
            }
          );
        }
      );

      return map;
    }, [items]);

  /* =========================================================
     ROOT ITEMS
  ========================================================= */

  const rootItems =
    useMemo(() => {
      if (!items) {
        return [];
      }

      if (
        type !==
        "categories"
      ) {
        return [
          ...items,
        ].sort(
          (a, b) =>
            String(
              a.name || ""
            ).localeCompare(
              String(
                b.name ||
                ""
              )
            )
        );
      }

      return items
        .filter(
          (item) => {
            const parentId =
              getParentId(
                item
              );

            return (
              !parentId ||
              !itemMap.has(
                String(
                  parentId
                )
              )
            );
          }
        )
        .sort(
          (a, b) => {
            const sortDifference =
              Number(
                a.sortOrder ||
                0
              ) -
              Number(
                b.sortOrder ||
                0
              );

            if (
              sortDifference !==
              0
            ) {
              return sortDifference;
            }

            return String(
              a.name || ""
            ).localeCompare(
              String(
                b.name ||
                ""
              )
            );
          }
        );
    }, [
      items,
      itemMap,
      type,
    ]);

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredItems =
    useMemo(() => {
      if (!items) {
        return [];
      }

      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return [];
      }

      return items.filter(
        (item) => {
          const parentName =
            item.parent
              ?.name ||
            itemMap.get(
              String(
                getParentId(
                  item
                )
              )
            )?.name;

          const searchable = [
            item.name,
            item.slug,
            item.description,
            parentName,
          ];

          return searchable
            .filter(Boolean)
            .some(
              (value) =>
                String(
                  value
                )
                  .toLowerCase()
                  .includes(
                    query
                  )
            );
        }
      );
    }, [
      items,
      search,
      itemMap,
    ]);

  /* =========================================================
     CATEGORY STATS
  ========================================================= */

  const stats =
    useMemo(() => {
      if (!items) {
        return {
          total: 0,
          topLevel: 0,
          children: 0,
          featured: 0,
          trending: 0,
        };
      }

      const topLevel =
        items.filter(
          (item) =>
            !getParentId(
              item
            )
        ).length;

      return {
        total:
          items.length,

        topLevel,

        children:
          items.length -
          topLevel,

        featured:
          items.filter(
            (item) =>
              item.featured
          ).length,

        trending:
          items.filter(
            (item) =>
              item.trending
          ).length,
      };
    }, [items]);

  /* =========================================================
     META BADGE
  ========================================================= */

  function MetaBadge({
    label,
  }) {
    return (
      <Box
        component="span"
        sx={{
          display:
            "inline-flex",

          alignItems:
            "center",

          px: 0.9,
          py: 0.35,

          borderRadius:
            "6px",

          backgroundColor:
            isDark
              ? alpha(
                theme
                  .palette
                  .common
                  .white,
                0.055
              )
              : alpha(
                theme
                  .palette
                  .common
                  .black,
                0.04
              ),

          color:
            "text.secondary",

          fontSize:
            "10px",

          fontWeight:
            600,

          lineHeight:
            1.3,
        }}
      >
        {label}
      </Box>
    );
  }

  /* =========================================================
     STAT BOX
  ========================================================= */

  function StatBox({
    number,
    label,
  }) {
    return (
      <Box
        sx={{
          minWidth: 0,

          px: 1.2,
          py: 1.1,

          borderRadius:
            "9px",

          border:
            "1px solid",

          borderColor:
            "divider",

          backgroundColor:
            isDark
              ? alpha(
                theme
                  .palette
                  .common
                  .white,
                0.04
              )
              : alpha(
                theme
                  .palette
                  .common
                  .black,
                0.025
              ),
        }}
      >
        <Typography
          sx={{
            fontSize:
              "17px",

            fontWeight:
              700,

            color:
              "text.primary",

            lineHeight:
              1.2,
          }}
        >
          {number}
        </Typography>

        <Typography
          sx={{
            mt: 0.25,

            overflow:
              "hidden",

            textOverflow:
              "ellipsis",

            whiteSpace:
              "nowrap",

            fontSize:
              "10px",

            color:
              "text.secondary",
          }}
        >
          {label}
        </Typography>
      </Box>
    );
  }

  /* =========================================================
     EMPTY LIST
  ========================================================= */

  function EmptyList({
    text,
  }) {
    return (
      <Box
        sx={{
          py: 7,
          px: 2,

          textAlign:
            "center",

          border:
            "1px dashed",

          borderColor:
            "divider",

          borderRadius:
            "12px",

          backgroundColor:
            isDark
              ? alpha(
                theme
                  .palette
                  .common
                  .white,
                0.015
              )
              : alpha(
                theme
                  .palette
                  .common
                  .black,
                0.01
              ),
        }}
      >
        <Typography
          sx={{
            fontSize:
              "14px",

            fontWeight:
              600,

            color:
              "text.primary",
          }}
        >
          {text}
        </Typography>

        <Typography
          sx={{
            mt: 0.6,

            fontSize:
              "12px",

            color:
              "text.secondary",
          }}
        >
          {type ===
            "categories"
            ? "Your category hierarchy will appear here."
            : "Your brand list will appear here."}
        </Typography>
      </Box>
    );
  }

  /* =========================================================
     TAXONOMY ROW
  ========================================================= */

  function renderItem(
    item,
    depth = 0
  ) {
    const id =
      String(item._id);

    const children =
      childrenMap.get(
        id
      ) || [];

    const parentId =
      getParentId(
        item
      );

    const parentName =
      item.parent?.name ||
      itemMap.get(
        String(
          parentId
        )
      )?.name;

    const image =
      type ===
        "categories"
        ? item.banner
        : item.logo;

    const filterCount =
      Array.isArray(
        item.filters
      )
        ? item.filters
          .length
        : 0;

    const selected =
      editing ===
      item._id;

    return (
      <Box
        key={item._id}
        sx={{
          position:
            "relative",

          mb: 1,

          ml:
            type ===
              "categories"
              ? {
                xs: 0,
                sm:
                  depth *
                  1.5,
              }
              : 0,

          minWidth: 0,
        }}
      >
        {/* CHILD CONNECTOR */}

        {depth > 0 &&
          type ===
          "categories" && (
            <Box
              sx={{
                display: {
                  xs:
                    "none",
                  sm:
                    "block",
                },

                position:
                  "absolute",

                left:
                  "-12px",

                top: 0,

                bottom: 0,

                width:
                  "1px",

                backgroundColor:
                  "divider",
              }}
            />
          )}

        {/* MAIN ROW */}

        <Box
          sx={{
            border:
              "1px solid",

            borderColor:
              selected
                ? theme
                  .palette
                  .primary
                  .main
                : isDark
                  ? alpha(
                    theme
                      .palette
                      .common
                      .white,
                    0.1
                  )
                  : alpha(
                    theme
                      .palette
                      .common
                      .black,
                    0.08
                  ),

            borderRadius:
              "12px",

            backgroundColor:
              selected
                ? alpha(
                  theme
                    .palette
                    .primary
                    .main,
                  isDark
                    ? 0.11
                    : 0.045
                )
                : theme
                  .palette
                  .background
                  .paper,

            transition:
              "border-color .18s ease, background-color .18s ease, box-shadow .18s ease, transform .18s ease",

            "&:hover": {
              borderColor:
                alpha(
                  theme
                    .palette
                    .primary
                    .main,
                  0.45
                ),

              transform:
                "translateY(-1px)",

              boxShadow:
                isDark
                  ? "0 10px 25px rgba(0,0,0,.18)"
                  : "0 10px 25px rgba(15,23,42,.06)",
            },
          }}
        >
          <Box
            sx={{
              p: {
                xs: 1.25,
                sm: 1.5,
              },

              display:
                "grid",

              gridTemplateColumns:
              {
                xs:
                  "1fr",

                lg:
                  "minmax(0,1fr) auto",
              },

              gap: 1.25,

              alignItems:
                "center",
            }}
          >
            {/* LEFT INFORMATION */}

            <Stack
              direction="row"
              spacing={1.25}
              sx={{
                minWidth: 0,
              }}
            >
              {/* THUMBNAIL */}

              <Box
                sx={{
                  width: 56,
                  height: 56,

                  flex:
                    "0 0 56px",

                  overflow:
                    "hidden",

                  borderRadius:
                    "9px",

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  border:
                    "1px solid",

                  borderColor:
                    "divider",

                  backgroundColor:
                    alpha(
                      theme
                        .palette
                        .primary
                        .main,
                      isDark
                        ? 0.12
                        : 0.07
                    ),

                  color:
                    theme
                      .palette
                      .primary
                      .main,

                  fontSize:
                    "20px",

                  fontWeight:
                    700,
                }}
              >
                {image ? (
                  <Box
                    component="img"
                    src={
                      image
                    }
                    alt={
                      item.name
                    }
                    sx={{
                      display:
                        "block",

                      width:
                        "100%",

                      height:
                        "100%",

                      objectFit:
                        "cover",
                    }}
                  />
                ) : (
                  String(
                    item.name ||
                    "C"
                  )
                    .slice(
                      0,
                      1
                    )
                    .toUpperCase()
                )}
              </Box>

              {/* TEXT */}

              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Stack
                  direction="row"
                  spacing={0.6}
                  useFlexGap
                  sx={{alignItems: "center", flexWrap: "wrap"}}
                >
                  <Typography
                    sx={{
                      fontSize:
                        "14px",

                      fontWeight:
                        700,

                      color:
                        "text.primary",

                      lineHeight:
                        1.35,
                    }}
                  >
                    {
                      item.name
                    }
                  </Typography>

                  {item.featured && (
                    <Chip
                      label="Featured"
                      size="small"
                      sx={{
                        height:
                          20,

                        fontSize:
                          "10px",

                        fontWeight:
                          600,

                        color:
                          theme
                            .palette
                            .primary
                            .main,

                        backgroundColor:
                          alpha(
                            theme
                              .palette
                              .primary
                              .main,
                            0.1
                          ),
                      }}
                    />
                  )}

                  {type ===
                    "categories" &&
                    item.trending && (
                      <Chip
                        label="Trending"
                        size="small"
                        sx={{
                          height:
                            20,

                          fontSize:
                            "10px",

                          fontWeight:
                            600,

                          color:
                            theme
                              .palette
                              .warning
                              .main,

                          backgroundColor:
                            alpha(
                              theme
                                .palette
                                .warning
                                .main,
                              0.12
                            ),
                        }}
                      />
                    )}
                </Stack>

                {/* SLUG */}

                <Typography
                  sx={{
                    mt: 0.25,

                    fontSize:
                      "11px",

                    color:
                      "text.secondary",

                    wordBreak:
                      "break-word",
                  }}
                >
                  /{item.slug}
                </Typography>

                {/* PARENT */}

                {parentName && (
                  <Typography
                    sx={{
                      mt: 0.4,

                      fontSize:
                        "11px",

                      color:
                        "text.secondary",
                    }}
                  >
                    Child of{" "}

                    <Box
                      component="span"
                      sx={{
                        color:
                          "text.primary",

                        fontWeight:
                          600,
                      }}
                    >
                      {
                        parentName
                      }
                    </Box>
                  </Typography>
                )}

                {/* DESCRIPTION */}

                {item.description && (
                  <Typography
                    sx={{
                      mt: 0.55,

                      maxWidth:
                        600,

                      color:
                        "text.secondary",

                      fontSize:
                        "11px",

                      lineHeight:
                        1.5,

                      display:
                        "-webkit-box",

                      WebkitLineClamp:
                        2,

                      WebkitBoxOrient:
                        "vertical",

                      overflow:
                        "hidden",
                    }}
                  >
                    {
                      item.description
                    }
                  </Typography>
                )}

                {/* META */}

                {type ===
                  "categories" && (
                    <Stack
                      direction="row"
                      spacing={0.55}
                      useFlexGap
                      sx={{
                        mt: 0.9,
                        flexWrap: "wrap"
                      }}
                    >
                      <MetaBadge
                        label={`Order ${item.sortOrder ??
                          0
                          }`}
                      />

                      <MetaBadge
                        label={`${children.length} ${children.length ===
                          1
                          ? "child"
                          : "children"
                          }`}
                      />

                      <MetaBadge
                        label={`${filterCount} ${filterCount ===
                          1
                          ? "filter"
                          : "filters"
                          }`}
                      />
                    </Stack>
                  )}
              </Box>
            </Stack>

            {/* ACTIONS */}

            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                justifySelf: {
                  xs:
                    "stretch",
                  lg:
                    "end",
                },

                width: {
                  xs:
                    "100%",
                  lg:
                    "auto",
                },
              }}
            >
              <Button
                type="button"
                size="small"
                variant="outlined"
                onClick={() =>
                  begin(item)
                }
                sx={{
                  flex: {
                    xs: 1,
                    lg:
                      "initial",
                  },

                  minWidth:
                    66,

                  minHeight:
                    34,

                  borderRadius:
                    "8px",

                  textTransform:
                    "none",

                  fontSize:
                    "11px",

                  fontWeight:
                    600,
                }}
              >
                Edit
              </Button>

              <Button
                type="button"
                size="small"
                color="error"
                variant="text"
                onClick={() =>
                  remove(
                    item._id
                  )
                }
                sx={{
                  flex: {
                    xs: 1,
                    lg:
                      "initial",
                  },

                  minWidth:
                    66,

                  minHeight:
                    34,

                  borderRadius:
                    "8px",

                  textTransform:
                    "none",

                  fontSize:
                    "11px",

                  fontWeight:
                    600,
                }}
              >
                Delete
              </Button>
            </Stack>
          </Box>
        </Box>

        {/* CHILDREN */}

        {type ===
          "categories" &&
          !search &&
          children.length >
          0 && (
            <Box
              sx={{
                mt: 1,
              }}
            >
              {children.map(
                (
                  child
                ) =>
                  renderItem(
                    child,
                    depth +
                    1
                  )
              )}
            </Box>
          )}
      </Box>
    );
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (!items) {
    return <Loading />;
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <Box
      sx={{
        width: "100%",

        minWidth: 0,

        display:
          "grid",

        /*
         * MOBILE
         * below 768px:
         * list first, form second
         */
        gridTemplateColumns:
          "minmax(0, 1fr)",

        gap: {
          xs: 2,
          md: 2.5,
        },

        alignItems:
          "start",

        /*
         * TABLET + DESKTOP
         * 768px and above:
         * side by side
         */
        "@media (min-width: 768px)":
        {
          gridTemplateColumns:
            "minmax(0, 1.15fr) minmax(300px, 0.85fr)",
        },
      }}
    >
      {/* =====================================================
          LEFT SIDE
          TAXONOMY LIST
      ====================================================== */}

      <Box
        sx={{
          width: "100%",
          minWidth: 0,

          border:
            "1px solid",

          borderColor:
            "divider",

          borderRadius:
            "14px",

          backgroundColor:
            "background.paper",

          overflow:
            "hidden",
        }}
      >
        {/* LIST HEADER */}

        <Box
          sx={{
            p: {
              xs: 1.75,
              sm: 2,
            },

            borderBottom:
              "1px solid",

            borderColor:
              "divider",
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}

            sx={{ justifyContent: "space-between", gap: 1.25, alignItems: { xs: "flex-start", sm: "center" } }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize:
                    "18px",

                  fontWeight:
                    700,

                  color:
                    "text.primary",

                  lineHeight:
                    1.3,
                }}
              >
                {type ===
                  "categories"
                  ? "Category library"
                  : "Brand library"}
              </Typography>

              <Typography
                sx={{
                  mt: 0.35,

                  maxWidth:
                    500,

                  fontSize:
                    "11px",

                  lineHeight:
                    1.5,

                  color:
                    "text.secondary",
                }}
              >
                {type ===
                  "categories"
                  ? "Browse and manage your catalog hierarchy, visibility, sorting and category filters."
                  : "Browse and manage product brands."}
              </Typography>
            </Box>

            <Chip
              label={`${items.length} ${pluralLabel}`}
              size="small"
              sx={{
                height: 25,

                fontSize:
                  "11px",

                fontWeight:
                  600,

                color:
                  theme
                    .palette
                    .primary
                    .main,

                backgroundColor:
                  alpha(
                    theme
                      .palette
                      .primary
                      .main,
                    0.1
                  ),
              }}
            />
          </Stack>

          {/* CATEGORY STATISTICS */}

          {type ===
            "categories" && (
              <Box
                sx={{
                  mt: 1.75,

                  display:
                    "grid",

                  gridTemplateColumns:
                  {
                    xs:
                      "repeat(2, minmax(0,1fr))",

                    sm:
                      "repeat(5, minmax(0,1fr))",
                  },

                  gap: 0.75,
                }}
              >
                <StatBox
                  number={
                    stats.total
                  }
                  label="Total"
                />

                <StatBox
                  number={
                    stats.topLevel
                  }
                  label="Top level"
                />

                <StatBox
                  number={
                    stats.children
                  }
                  label="Children"
                />

                <StatBox
                  number={
                    stats.featured
                  }
                  label="Featured"
                />

                <StatBox
                  number={
                    stats.trending
                  }
                  label="Trending"
                />
              </Box>
            )}

          {/* SEARCH */}

          <Box
            sx={{
              mt: 1.75,
            }}
          >
            <MuiInput
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder={
                type ===
                  "categories"
                  ? "Search category name, slug or description..."
                  : "Search brand name, slug or description..."
              }
            />
          </Box>
        </Box>

        {/* LIST CONTENT */}

        <Box
          sx={{
            p: {
              xs: 1.1,
              sm: 1.5,
            },

            /*
             * MOBILE:
             * normal page flow
             */
            maxHeight:
              "none",

            overflowY:
              "visible",

            /*
             * TABLET + DESKTOP:
             * internal list scrolling
             */
            "@media (min-width: 768px)":
            {
              maxHeight:
                "calc(100vh - 170px)",

              minHeight:
                "420px",

              overflowY:
                "auto",

              overscrollBehavior:
                "contain",

              scrollbarWidth:
                "thin",

              scrollbarColor:
                `${theme.palette.divider} transparent`,

              "&::-webkit-scrollbar":
              {
                width:
                  "6px",
              },

              "&::-webkit-scrollbar-track":
              {
                background:
                  "transparent",
              },

              "&::-webkit-scrollbar-thumb":
              {
                borderRadius:
                  "30px",

                backgroundColor:
                  theme
                    .palette
                    .divider,
              },
            },
          }}
        >
          {search ? (
            filteredItems.length >
              0 ? (
              <>
                <Typography
                  sx={{
                    mb: 1,

                    px: 0.35,

                    fontSize:
                      "10px",

                    fontWeight:
                      700,

                    letterSpacing:
                      ".08em",

                    textTransform:
                      "uppercase",

                    color:
                      "text.secondary",
                  }}
                >
                  {
                    filteredItems.length
                  }{" "}
                  search{" "}
                  {filteredItems.length ===
                    1
                    ? "result"
                    : "results"}
                </Typography>

                {filteredItems.map(
                  (
                    item
                  ) =>
                    renderItem(
                      item
                    )
                )}
              </>
            ) : (
              <EmptyList
                text={`No matching ${pluralLabel} found.`}
              />
            )
          ) : rootItems.length >
            0 ? (
            rootItems.map(
              (item) =>
                renderItem(
                  item
                )
            )
          ) : (
            <EmptyList
              text={`No ${pluralLabel} have been created yet.`}
            />
          )}
        </Box>
      </Box>

      {/* =====================================================
          RIGHT SIDE
          CREATE / EDIT FORM
      ====================================================== */}

      <Box
        component="form"
        className="form-card"
        onSubmit={save}
        sx={{
          width: "100%",

          minWidth: 0,

          /*
           * MOBILE
           */
          position:
            "relative",

          top: "auto",

          /*
           * TABLET + DESKTOP
           */
          "@media (min-width: 768px)":
          {
            position:
              "sticky",

            top:
              "88px",

            alignSelf:
              "start",
          },
        }}
      >
        {/* FORM HEADER */}

        <div className="data-card-head">
          <h2>
            {editing
              ? "Edit"
              : "Add"}{" "}
            {singularLabel}
          </h2>

          {editing && (
            <MuiButton
              type="button"
              className="link-button"
              onClick={
                reset
              }
            >
              Cancel
            </MuiButton>
          )}
        </div>

        {/* NAME */}

        <div className="field">
          <label>
            Name
          </label>

          <MuiInput
            value={
              form.name
            }
            onChange={(
              event
            ) =>
              setForm(
                (current) => ({
                  ...current,

                  name:
                    event
                      .target
                      .value,
                })
              )
            }
            required
          />
        </div>

        {/* SLUG */}

        <div className="field">
          <label>
            Slug
          </label>

          <MuiInput
            value={
              form.slug
            }
            onChange={(
              event
            ) =>
              setForm(
                (current) => ({
                  ...current,

                  slug:
                    event
                      .target
                      .value,
                })
              )
            }
            required
          />
        </div>

        {/* =================================================
            CATEGORY SPECIFIC
        ================================================== */}

        {type ===
          "categories" && (
            <>
              {/* PARENT */}

              <div className="field">
                <label>
                  Parent
                </label>

                <MuiSelect
                  value={
                    form.parent ||
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,

                        parent:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                >
                  <option value="">
                    Top level
                  </option>

                  {items
                    .filter(
                      (
                        item
                      ) =>
                        item._id !==
                        editing
                    )
                    .map(
                      (
                        item
                      ) => (
                        <option
                          key={
                            item._id
                          }
                          value={
                            item._id
                          }
                        >
                          {
                            item.name
                          }
                        </option>
                      )
                    )}
                </MuiSelect>
              </div>

              {/* BANNER */}

              <div className="field">
                <label>
                  Banner URL
                </label>

                <MuiInput
                  value={
                    form.banner ||
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,

                        banner:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="https://..."
                />
              </div>

              {/* BANNER PREVIEW */}

              {form.banner && (
                <Box
                  sx={{
                    mb: 2,

                    overflow:
                      "hidden",

                    height:
                      130,

                    border:
                      "1px solid",

                    borderColor:
                      "divider",

                    borderRadius:
                      "10px",

                    backgroundColor:
                      "background.default",
                  }}
                >
                  <Box
                    component="img"
                    src={
                      form.banner
                    }
                    alt="Category banner preview"
                    sx={{
                      display:
                        "block",

                      width:
                        "100%",

                      height:
                        "100%",

                      objectFit:
                        "cover",
                    }}
                  />
                </Box>
              )}

              {/* SORT */}

              <div className="field">
                <label>
                  Sort order
                </label>

                <MuiInput
                  type="number"
                  value={
                    form.sortOrder ??
                    0
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,

                        sortOrder:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                />
              </div>

              {/* FILTER JSON */}

              <div className="field">
                <label>
                  Category-specific
                  filters (JSON)
                </label>

                <MuiTextarea
                  value={
                    filtersText
                  }
                  onChange={(
                    event
                  ) =>
                    setFiltersText(
                      event.target
                        .value
                    )
                  }
                  placeholder='[{"key":"Color","label":"Color","options":["Black","White"]}]'
                  style={{
                    minHeight:
                      140,

                    fontFamily:
                      "monospace",

                    fontSize:
                      12,
                  }}
                />
              </div>
            </>
          )}

        {/* =================================================
            BRAND SPECIFIC
        ================================================== */}

        {type ===
          "brands" && (
            <>
              <div className="field">
                <label>
                  Logo URL
                </label>

                <MuiInput
                  value={
                    form.logo ||
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,

                        logo:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="https://..."
                />
              </div>

              {form.logo && (
                <Box
                  sx={{
                    mb: 2,

                    p: 2,

                    height:
                      110,

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",

                    border:
                      "1px solid",

                    borderColor:
                      "divider",

                    borderRadius:
                      "10px",

                    backgroundColor:
                      "background.default",
                  }}
                >
                  <Box
                    component="img"
                    src={
                      form.logo
                    }
                    alt="Brand logo preview"
                    sx={{
                      display:
                        "block",

                      maxWidth:
                        "100%",

                      maxHeight:
                        "75px",

                      objectFit:
                        "contain",
                    }}
                  />
                </Box>
              )}
            </>
          )}

        {/* DESCRIPTION */}

        <div className="field">
          <label>
            Description
          </label>

          <MuiTextarea
            value={
              form.description ||
              ""
            }
            onChange={(
              event
            ) =>
              setForm(
                (current) => ({
                  ...current,

                  description:
                    event
                      .target
                      .value,
                })
              )
            }
          />
        </div>

        {/* SEO TITLE */}

        <div className="field">
          <label>
            SEO title
          </label>

          <MuiInput
            value={
              form.seo
                ?.title ||
              ""
            }
            onChange={(
              event
            ) =>
              setForm(
                (current) => ({
                  ...current,

                  seo: {
                    ...current.seo,

                    title:
                      event
                        .target
                        .value,
                  },
                })
              )
            }
          />
        </div>

        {/* SEO DESCRIPTION */}

        <div className="field">
          <label>
            SEO description
          </label>

          <MuiTextarea
            value={
              form.seo
                ?.description ||
              ""
            }
            onChange={(
              event
            ) =>
              setForm(
                (current) => ({
                  ...current,

                  seo: {
                    ...current.seo,

                    description:
                      event
                        .target
                        .value,
                  },
                })
              )
            }
          />
        </div>

        {/* FLAGS */}

        <Stack
          direction="row"
          spacing={2}
          useFlexGap
          sx={{
            mt: 1,
            flexWrap: "wrap"
          }}
        >
          <label>
            <MuiInput
              type="checkbox"
              checked={Boolean(
                form.featured
              )}
              onChange={(
                event
              ) =>
                setForm(
                  (
                    current
                  ) => ({
                    ...current,

                    featured:
                      event
                        .target
                        .checked,
                  })
                )
              }
            />

            {" "}
            Featured
          </label>

          {type ===
            "categories" && (
              <label>
                <MuiInput
                  type="checkbox"
                  checked={Boolean(
                    form.trending
                  )}
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,

                        trending:
                          event
                            .target
                            .checked,
                      })
                    )
                  }
                />

                {" "}
                Trending
              </label>
            )}
        </Stack>

        {/* SUBMIT */}

        <MuiButton
          type="submit"
          className="button dark"
          style={{
            marginTop:
              18,
          }}
        >
          {editing
            ? "Save changes"
            : `Create ${singularLabel}`}
        </MuiButton>
      </Box>
    </Box>
  );
}