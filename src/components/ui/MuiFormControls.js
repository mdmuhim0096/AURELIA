"use client";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Radio from "@mui/material/Radio";
import Input from "@mui/material/Input";
import TextField from "@mui/material/TextField";

function buttonVariant(className = "") {
  if (/\b(dark|acid|primary)\b/.test(className)) return "contained";
  if (/\b(ghost|secondary)\b/.test(className)) return "outlined";
  return "outlined";
}

export function MuiButton({ className = "", type, ...props }) {
  return (
    <Button
      {...props}
      type={type || "submit"}
      className={className}
      variant={buttonVariant(className)}
      color={/\bsecondary\b/.test(className) ? "secondary" : "primary"}
    />
  );
}


import {
  alpha,
  useTheme,
} from "@mui/material/styles";

export function MuiInput({
  type = "text",
  className = "",
  accept,
  multiple,
  min,
  max,
  step,
  minLength,
  maxLength,
  pattern,
  inputMode,
  sx,
  slotProps,
  ...props
}) {
  const theme = useTheme();

  const isDark =
    theme.palette.mode === "dark";

  const backgroundColor = isDark
    ? "#111827"
    : "#FFFFFF";

  const hoverBackgroundColor = isDark
    ? "#141D2B"
    : "#FCFCFD";

  const borderColor = isDark
    ? "rgba(255, 255, 255, 0.14)"
    : "#D0D5DD";

  const hoverBorderColor = isDark
    ? "rgba(255, 255, 255, 0.30)"
    : "#98A2B3";

  const disabledBackground = isDark
    ? "rgba(255, 255, 255, 0.04)"
    : "#F2F4F7";

  const placeholderColor = isDark
    ? "#667085"
    : "#98A2B3";

  const sharedInputStyles = {
    "& .MuiOutlinedInput-root": {
      minHeight: 46,

      backgroundColor,

      color:
        theme.palette.text.primary,

      borderRadius: "10px",

      transition:
        "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",

      "& .MuiOutlinedInput-notchedOutline": {
        borderColor,
        borderWidth: "1px",
      },

      "&:hover": {
        backgroundColor:
          hoverBackgroundColor,
      },

      "&:hover .MuiOutlinedInput-notchedOutline":
      {
        borderColor:
          hoverBorderColor,
      },

      "&.Mui-focused": {
        backgroundColor,
        boxShadow: `0 0 0 3px ${alpha(
          theme.palette.primary.main,
          isDark ? 0.2 : 0.12
        )}`,
      },

      "&.Mui-focused .MuiOutlinedInput-notchedOutline":
      {
        borderColor:
          theme.palette.primary.main,

        borderWidth: "1.5px",
      },

      "&.Mui-error .MuiOutlinedInput-notchedOutline":
      {
        borderColor:
          theme.palette.error.main,
      },

      "&.Mui-error.Mui-focused": {
        boxShadow: `0 0 0 3px ${alpha(
          theme.palette.error.main,
          0.12
        )}`,
      },

      "&.Mui-disabled": {
        backgroundColor:
          disabledBackground,

        color:
          theme.palette.text.disabled,

        cursor: "not-allowed",
      },

      "&.Mui-disabled .MuiOutlinedInput-notchedOutline":
      {
        borderColor: isDark
          ? "rgba(255,255,255,0.08)"
          : "#EAECF0",
      },
    },

    "& .MuiInputBase-input": {
      padding:
        "11px 14px",

      fontSize: "14px",

      fontWeight: 400,

      lineHeight: 1.5,

      color:
        theme.palette.text.primary,

      "&::placeholder": {
        color:
          placeholderColor,

        opacity: 1,
      },

      "&:-webkit-autofill": {
        WebkitBoxShadow: `0 0 0 1000px ${backgroundColor} inset`,

        WebkitTextFillColor:
          theme.palette.text.primary,

        caretColor:
          theme.palette.text.primary,

        borderRadius:
          "inherit",

        transition:
          "background-color 5000s ease-in-out 0s",
      },
    },

    // Remove ugly number arrows if desired
    '& input[type="number"]': {
      MozAppearance: "textfield",
    },

    '& input[type="number"]::-webkit-outer-spin-button, & input[type="number"]::-webkit-inner-spin-button':
    {
      WebkitAppearance: "none",
      margin: 0,
    },
  };

  /* ---------------------------------
     Hidden input
  ---------------------------------- */

  if (type === "hidden") {
    return (
      <input
        type="hidden"
        {...props}
      />
    );
  }

  /* ---------------------------------
     Checkbox
  ---------------------------------- */

  if (type === "checkbox") {
    return (
      <Checkbox
        {...props}
        className={className}
        size="small"
        sx={{
          padding: "5px",

          color: isDark
            ? "#667085"
            : "#98A2B3",

          transition:
            "color 0.2s ease",

          "&.Mui-checked": {
            color:
              theme.palette.primary.main,
          },

          "&:hover": {
            backgroundColor: alpha(
              theme.palette.primary.main,
              0.08
            ),
          },

          ...sx,
        }}
      />
    );
  }

  /* ---------------------------------
     Radio
  ---------------------------------- */

  if (type === "radio") {
    return (
      <Radio
        {...props}
        className={className}
        size="small"
        sx={{
          padding: "5px",

          color: isDark
            ? "#667085"
            : "#98A2B3",

          "&.Mui-checked": {
            color:
              theme.palette.primary.main,
          },

          "&:hover": {
            backgroundColor: alpha(
              theme.palette.primary.main,
              0.08
            ),
          },

          ...sx,
        }}
      />
    );
  }

  /* ---------------------------------
     File input
  ---------------------------------- */

  if (type === "file") {
    return (
      <Input
        {...props}
        type="file"
        className={className}
        fullWidth
        disableUnderline
        slotProps={{
          input: {
            accept,
            multiple,
            ...slotProps?.input,
          },
        }}
        sx={{
          minHeight: 48,

          px: "6px",

          py: "5px",

          backgroundColor,

          color:
            theme.palette.text.primary,

          border: `1px solid ${borderColor}`,

          borderRadius: "10px",

          transition:
            "all 0.2s ease",

          "&:hover": {
            borderColor:
              hoverBorderColor,

            backgroundColor:
              hoverBackgroundColor,
          },

          "&.Mui-focused": {
            borderColor:
              theme.palette.primary.main,

            boxShadow: `0 0 0 3px ${alpha(
              theme.palette.primary.main,
              isDark ? 0.2 : 0.12
            )}`,
          },

          "& .MuiInputBase-input":
          {
            padding: 0,

            fontSize:
              "14px",

            color:
              theme.palette.text.primary,
          },

          "& input::file-selector-button":
          {
            height: 36,

            marginRight:
              "12px",

            padding:
              "0 14px",

            border: 0,

            borderRadius:
              "7px",

            backgroundColor: isDark
              ? alpha(
                theme.palette.primary.main,
                0.16
              )
              : alpha(
                theme.palette.primary.main,
                0.08
              ),

            color:
              theme.palette.primary.main,

            fontSize:
              "13px",

            fontWeight:
              600,

            cursor:
              "pointer",

            transition:
              "all 0.2s ease",
          },

          "& input::file-selector-button:hover":
          {
            backgroundColor:
              alpha(
                theme.palette.primary.main,
                isDark
                  ? 0.25
                  : 0.14
              ),
          },

          ...sx,
        }}
      />
    );
  }

  /* ---------------------------------
     Normal text / number / email etc.
  ---------------------------------- */

  return (
    <TextField
      {...props}
      type={type}
      className={className}
      size="small"
      fullWidth
      variant="outlined"
      slotProps={{
        ...slotProps,

        htmlInput: {
          min,
          max,
          step,
          minLength,
          maxLength,
          pattern,
          inputMode,

          ...slotProps?.htmlInput,
        },
      }}
      sx={{
        ...sharedInputStyles,
        ...sx,
      }}
    />
  );
}


import {
  MenuItem,
} from "@mui/material";


import {
  Children,
  isValidElement,
  useEffect,
  useState,
} from "react";


// export function MuiSelect({
//   className = "",
//   children,
//   sx,
//   slotProps,
//   ...props
// }) {
//   const theme = useTheme();

//   const isDark =
//     theme.palette.mode === "dark";

//   const backgroundColor =
//     theme.palette.background.paper;

//   const textColor =
//     theme.palette.text.primary;

//   const secondaryTextColor =
//     theme.palette.text.secondary;

//   const borderColor = isDark
//     ? alpha(
//         theme.palette.common.white,
//         0.16
//       )
//     : alpha(
//         theme.palette.common.black,
//         0.18
//       );

//   const hoverBorderColor = isDark
//     ? alpha(
//         theme.palette.common.white,
//         0.32
//       )
//     : alpha(
//         theme.palette.common.black,
//         0.32
//       );

//   /*
//    * Convert your existing:
//    *
//    * <option value="draft">draft</option>
//    *
//    * into:
//    *
//    * <MenuItem value="draft">draft</MenuItem>
//    *
//    * automatically.
//    */
//   const convertedChildren =
//     Children.map(
//       children,
//       (child) => {
//         if (!isValidElement(child)) {
//           return child;
//         }

//         if (child.type === "option") {
//           return (
//             <MenuItem
//               key={
//                 child.key ??
//                 child.props.value
//               }
//               value={
//                 child.props.value
//               }
//               disabled={
//                 child.props.disabled
//               }
//             >
//               {child.props.children}
//             </MenuItem>
//           );
//         }

//         return child;
//       }
//     );

//   return (
//     <TextField
//       {...props}
//       select
//       fullWidth
//       size="small"
//       variant="outlined"
//       className={className}

//       slotProps={{
//         ...slotProps,

//         select: {
//           ...slotProps?.select,

//           /*
//            * IMPORTANT:
//            * Do NOT use native: true here.
//            *
//            * MUI now controls the dropdown.
//            */
//           MenuProps: {
//             ...slotProps?.select
//               ?.MenuProps,

//             PaperProps: {
//               ...slotProps?.select
//                 ?.MenuProps
//                 ?.PaperProps,

//               sx: {
//                 mt: 0.75,

//                 maxHeight: 320,

//                 borderRadius:
//                   "10px",

//                 backgroundColor:
//                   theme.palette
//                     .background.paper,

//                 backgroundImage:
//                   "none",

//                 color:
//                   textColor,

//                 border: `1px solid ${
//                   isDark
//                     ? alpha(
//                         theme.palette
//                           .common.white,
//                         0.12
//                       )
//                     : alpha(
//                         theme.palette
//                           .common.black,
//                         0.1
//                       )
//                 }`,

//                 boxShadow: isDark
//                   ? "0 16px 45px rgba(0, 0, 0, 0.45)"
//                   : "0 16px 45px rgba(15, 23, 42, 0.14)",

//                 /*
//                  * Dropdown list
//                  */
//                 "& .MuiMenu-list": {
//                   padding:
//                     "6px",
//                 },

//                 /*
//                  * Every option
//                  */
//                 "& .MuiMenuItem-root":
//                   {
//                     minHeight:
//                       40,

//                     padding:
//                       "8px 12px",

//                     margin:
//                       "2px 0",

//                     borderRadius:
//                       "7px",

//                     fontSize:
//                       "14px",

//                     fontWeight:
//                       400,

//                     color:
//                       `${textColor} !important`,

//                     WebkitTextFillColor:
//                       `${textColor} !important`,

//                     transition:
//                       "background-color 0.15s ease, color 0.15s ease",

//                     /*
//                      * Hover
//                      */
//                     "&:hover": {
//                       backgroundColor:
//                         alpha(
//                           theme.palette
//                             .primary
//                             .main,
//                           isDark
//                             ? 0.14
//                             : 0.08
//                         ),
//                     },

//                     /*
//                      * Selected
//                      */
//                     "&.Mui-selected":
//                       {
//                         backgroundColor:
//                           alpha(
//                             theme.palette
//                               .primary
//                               .main,
//                             isDark
//                               ? 0.2
//                               : 0.1
//                           ),

//                         color:
//                           `${theme.palette.primary.main} !important`,

//                         WebkitTextFillColor:
//                           `${theme.palette.primary.main} !important`,

//                         fontWeight:
//                           600,

//                         "&:hover":
//                           {
//                             backgroundColor:
//                               alpha(
//                                 theme.palette
//                                   .primary
//                                   .main,
//                                 isDark
//                                   ? 0.26
//                                   : 0.14
//                               ),
//                           },
//                       },

//                     /*
//                      * Disabled
//                      */
//                     "&.Mui-disabled":
//                       {
//                         opacity:
//                           0.45,

//                         color:
//                           `${theme.palette.text.disabled} !important`,
//                       },
//                   },

//                 ...slotProps
//                   ?.select
//                   ?.MenuProps
//                   ?.PaperProps
//                   ?.sx,
//               },
//             },
//           },
//         },
//       }}

//       sx={{
//         /*
//          * ============================
//          * MAIN SELECT
//          * ============================
//          */

//         "& .MuiOutlinedInput-root":
//           {
//             minHeight: 46,

//             backgroundColor,

//             color:
//               textColor,

//             borderRadius:
//               "10px",

//             transition:
//               "background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",

//             /*
//              * Border
//              */
//             "& .MuiOutlinedInput-notchedOutline":
//               {
//                 borderColor,
//                 borderWidth:
//                   "1px",
//               },

//             /*
//              * Hover
//              */
//             "&:hover": {
//               backgroundColor:
//                 isDark
//                   ? alpha(
//                       theme.palette
//                         .common.white,
//                       0.025
//                     )
//                   : alpha(
//                       theme.palette
//                         .common.black,
//                       0.015
//                     ),
//             },

//             "&:hover .MuiOutlinedInput-notchedOutline":
//               {
//                 borderColor:
//                   hoverBorderColor,
//               },

//             /*
//              * Focus
//              */
//             "&.Mui-focused":
//               {
//                 backgroundColor,

//                 boxShadow: `0 0 0 3px ${alpha(
//                   theme.palette
//                     .primary.main,
//                   isDark
//                     ? 0.2
//                     : 0.11
//                 )}`,
//               },

//             "&.Mui-focused .MuiOutlinedInput-notchedOutline":
//               {
//                 borderColor:
//                   theme.palette
//                     .primary.main,

//                 borderWidth:
//                   "1.5px",
//               },

//             /*
//              * Error
//              */
//             "&.Mui-error .MuiOutlinedInput-notchedOutline":
//               {
//                 borderColor:
//                   theme.palette
//                     .error.main,
//               },

//             "&.Mui-error.Mui-focused":
//               {
//                 boxShadow: `0 0 0 3px ${alpha(
//                   theme.palette
//                     .error.main,
//                   0.12
//                 )}`,
//               },

//             /*
//              * Disabled
//              */
//             "&.Mui-disabled":
//               {
//                 backgroundColor:
//                   isDark
//                     ? alpha(
//                         theme.palette
//                           .common.white,
//                         0.035
//                       )
//                     : alpha(
//                         theme.palette
//                           .common.black,
//                         0.035
//                       ),
//               },
//           },

//         /*
//          * ============================
//          * SELECTED VALUE TEXT
//          * ============================
//          */

//         "& .MuiSelect-select": {
//           display:
//             "flex",

//           alignItems:
//             "center",

//           minHeight:
//             "auto !important",

//           padding:
//             "11px 42px 11px 14px !important",

//           fontSize:
//             "14px",

//           fontWeight:
//             400,

//           lineHeight:
//             1.5,

//           color:
//             `${textColor} !important`,

//           WebkitTextFillColor:
//             `${textColor} !important`,

//           backgroundColor:
//             "transparent !important",
//         },

//         /*
//          * Disabled selected text
//          */
//         "& .Mui-disabled .MuiSelect-select":
//           {
//             color:
//               `${theme.palette.text.disabled} !important`,

//             WebkitTextFillColor:
//               `${theme.palette.text.disabled} !important`,
//           },

//         /*
//          * ============================
//          * ARROW
//          * ============================
//          */

//         "& .MuiSelect-icon": {
//           right:
//             "12px",

//           color:
//             secondaryTextColor,

//           transition:
//             "color 0.2s ease, transform 0.2s ease",
//         },

//         "& .MuiOutlinedInput-root:hover .MuiSelect-icon":
//           {
//             color:
//               textColor,
//           },

//         "& .MuiOutlinedInput-root.Mui-focused .MuiSelect-icon":
//           {
//             color:
//               theme.palette
//                 .primary.main,
//           },

//         "& .MuiSelect-iconOpen":
//           {
//             transform:
//               "rotate(180deg)",
//           },

//         /*
//          * ============================
//          * LABEL
//          * ============================
//          */

//         "& .MuiInputLabel-root":
//           {
//             color:
//               secondaryTextColor,

//             fontSize:
//               "14px",

//             "&.Mui-focused":
//               {
//                 color:
//                   theme.palette
//                     .primary.main,
//               },

//             "&.Mui-error":
//               {
//                 color:
//                   theme.palette
//                     .error.main,
//               },

//             "&.Mui-disabled":
//               {
//                 color:
//                   theme.palette
//                     .text.disabled,
//               },
//           },

//         /*
//          * ============================
//          * HELPER TEXT
//          * ============================
//          */

//         "& .MuiFormHelperText-root":
//           {
//             marginLeft:
//               "2px",

//             marginTop:
//               "6px",

//             fontSize:
//               "12px",

//             color:
//               secondaryTextColor,

//             "&.Mui-error":
//               {
//                 color:
//                   theme.palette
//                     .error.main,
//               },
//           },

//         /*
//          * Allow additional sx
//          */
//         ...sx,
//       }}
//     >
//       {convertedChildren}
//     </TextField>
//   );
// }

export function MuiSelect({
  className = "",
  children,
  sx,
  slotProps,

  value,
  defaultValue = "",
  onChange,

  ...props
}) {
  const theme = useTheme();

  const isDark =
    theme.palette.mode === "dark";

  const backgroundColor =
    theme.palette.background.paper;

  const textColor =
    theme.palette.text.primary;

  const secondaryTextColor =
    theme.palette.text.secondary;

  const borderColor = isDark
    ? alpha(
      theme.palette.common.white,
      0.16
    )
    : alpha(
      theme.palette.common.black,
      0.18
    );

  const hoverBorderColor =
    isDark
      ? alpha(
        theme.palette.common.white,
        0.32
      )
      : alpha(
        theme.palette.common.black,
        0.32
      );

  /*
   * ------------------------------------------------
   * CONTROLLED SELECT FIX
   * ------------------------------------------------
   *
   * If parent provides `value`, use it.
   * Otherwise maintain an internal controlled value.
   *
   * This prevents:
   *
   * "changing the default value state of an
   * uncontrolled Select"
   */
  const [internalValue, setInternalValue] =
    useState(
      value !== undefined
        ? value
        : defaultValue ?? ""
    );

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
      return;
    }

    setInternalValue(
      defaultValue ?? ""
    );
  }, [value, defaultValue]);

  const currentValue =
    value !== undefined
      ? value
      : internalValue;

  function handleChange(event) {
    if (value === undefined) {
      setInternalValue(
        event.target.value
      );
    }

    onChange?.(event);
  }

  /*
   * Convert:
   *
   * <option value="draft">
   *   draft
   * </option>
   *
   * automatically into MUI MenuItem.
   */
  const convertedChildren =
    Children.map(
      children,
      (child) => {
        if (
          !isValidElement(child)
        ) {
          return child;
        }

        if (
          child.type === "option"
        ) {
          return (
            <MenuItem
              key={
                child.key ??
                child.props.value
              }
              value={
                child.props.value
              }
              disabled={
                child.props.disabled
              }
            >
              {child.props.children}
            </MenuItem>
          );
        }

        return child;
      }
    );

  return (
    <TextField
      {...props}
      select
      fullWidth
      size="small"
      variant="outlined"
      className={className}

      /*
       * IMPORTANT:
       *
       * Do not forward defaultValue.
       * Always give MUI a value.
       */
      value={currentValue}
      onChange={handleChange}

      slotProps={{
        ...slotProps,

        select: {
          ...slotProps?.select,

          MenuProps: {
            ...slotProps?.select
              ?.MenuProps
          },
        },
      }}

      sx={{
        /*
         * ============================
         * MAIN SELECT
         * ============================
         */
        "& .MuiOutlinedInput-root":
        {
          minHeight: 46,

          backgroundColor,

          color:
            textColor,

          borderRadius:
            "10px",

          transition:
            "background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",

          "& .MuiOutlinedInput-notchedOutline":
          {
            borderColor,

            borderWidth:
              "1px",
          },

          "&:hover": {
            backgroundColor:
              isDark
                ? alpha(
                  theme.palette
                    .common.white,
                  0.025
                )
                : alpha(
                  theme.palette
                    .common.black,
                  0.015
                ),
          },

          "&:hover .MuiOutlinedInput-notchedOutline":
          {
            borderColor:
              hoverBorderColor,
          },

          "&.Mui-focused":
          {
            backgroundColor,

            boxShadow:
              `0 0 0 3px ${alpha(
                theme.palette
                  .primary.main,

                isDark
                  ? 0.2
                  : 0.11
              )}`,
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline":
          {
            borderColor:
              theme.palette
                .primary.main,

            borderWidth:
              "1.5px",
          },

          "&.Mui-error .MuiOutlinedInput-notchedOutline":
          {
            borderColor:
              theme.palette
                .error.main,
          },

          "&.Mui-error.Mui-focused":
          {
            boxShadow:
              `0 0 0 3px ${alpha(
                theme.palette
                  .error.main,
                0.12
              )}`,
          },

          "&.Mui-disabled":
          {
            backgroundColor:
              isDark
                ? alpha(
                  theme.palette
                    .common.white,
                  0.035
                )
                : alpha(
                  theme.palette
                    .common.black,
                  0.035
                ),
          },
        },

        /*
         * ============================
         * SELECTED VALUE TEXT
         * ============================
         */
        "& .MuiSelect-select": {
          display:
            "flex",

          alignItems:
            "center",

          minHeight:
            "auto !important",

          padding:
            "11px 42px 11px 14px !important",

          fontSize:
            "14px",

          fontWeight:
            400,

          lineHeight:
            1.5,

          color:
            `${textColor} !important`,

          WebkitTextFillColor:
            `${textColor} !important`,

          backgroundColor:
            "transparent !important",
        },

        "& .Mui-disabled .MuiSelect-select":
        {
          color:
            `${theme.palette.text.disabled} !important`,

          WebkitTextFillColor:
            `${theme.palette.text.disabled} !important`,
        },

        /*
         * ============================
         * ARROW
         * ============================
         */
        "& .MuiSelect-icon": {
          right: "12px",

          color:
            secondaryTextColor,

          transition:
            "color 0.2s ease, transform 0.2s ease",
        },

        "& .MuiOutlinedInput-root:hover .MuiSelect-icon":
        {
          color:
            textColor,
        },

        "& .MuiOutlinedInput-root.Mui-focused .MuiSelect-icon":
        {
          color:
            theme.palette
              .primary.main,
        },

        "& .MuiSelect-iconOpen":
        {
          transform:
            "rotate(180deg)",
        },

        /*
         * ============================
         * LABEL
         * ============================
         */
        "& .MuiInputLabel-root":
        {
          color:
            secondaryTextColor,

          fontSize:
            "14px",

          "&.Mui-focused":
          {
            color:
              theme.palette
                .primary.main,
          },

          "&.Mui-error":
          {
            color:
              theme.palette
                .error.main,
          },

          "&.Mui-disabled":
          {
            color:
              theme.palette
                .text.disabled,
          },
        },

        /*
         * ============================
         * HELPER TEXT
         * ============================
         */
        "& .MuiFormHelperText-root":
        {
          marginLeft:
            "2px",

          marginTop:
            "6px",

          fontSize:
            "12px",

          color:
            secondaryTextColor,

          "&.Mui-error":
          {
            color:
              theme.palette
                .error.main,
          },
        },

        ...sx,
      }}
    >
      {convertedChildren}
    </TextField>
  );
}

export function MuiTextarea({ className = "", rows, minLength, maxLength, ...props }) {
  return (
    <TextField
      {...props}
      className={className}
      fullWidth
      multiline
      minRows={rows || 3}
      size="small"
      slotProps={{ htmlInput: { minLength, maxLength } }}
    />
  );
}
