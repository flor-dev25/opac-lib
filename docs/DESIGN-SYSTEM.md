# infoLib Design System

This document defines the visual language and component architecture for the Library Management System, ensuring strict parity with the `wireframe-1` specifications while adhering to DRY (Don't Repeat Yourself) principles.

## 1. Visual Language

### Core Color Palette
| Token | Hex Code | Usage |
| :--- | :--- | :--- |
| **Surface-Classic** | `#D4D0C8` | Primary window background and non-interactive areas. |
| **Surface-Light** | `#FFFFFF` | Input fields and data grid backgrounds. |
| **Surface-Accent** | `#008080` | Specialized footers (e.g., About dialog). |
| **Primary-Blue** | `#000080` | Selection highlights and focused text. |
| **Border-Light** | `#FFFFFF` | Top/Left highlight of beveled edges. |
| **Border-Dark** | `#808080` | Bottom/Right shadow of beveled edges. |
| **Text-Main** | `#000000` | Primary labels and grid data. |
| **Text-Green** | `#008000` | Auto-generated identifiers (Control No.). |
| **Text-Error** | `#FF0000` | Critical warnings and error messages. |

### Typography
| Level | Font Family | Size | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | Sans-Serif (Inter/Roboto) | 16px | 700 | Branding logos |
| **Heading** | Sans-Serif | 14px | 600 | Dialog titles, Group labels |
| **Body** | Sans-Serif | 12px | 400 | Grid data, Labels, Inputs |
| **Small** | Sans-Serif | 10px | 400 | Help text, system info |

## 2. Component Library (DRY Standards)

### A. Action Components
*   **ToolbarItem**: A button containing a 32x32px icon and a bottom-aligned text label.
*   **Button-Classic**: Standard beveled button with 2px padding and centered text.
*   **IconButton**: Small button for list actions or window controls.

### B. Input Components
*   **FieldGroup**: A horizontal flex container with a fixed-width label (approx. 100px) and a flexible input field.
*   **ComboSearch**: A unified input group containing a text field, a scope dropdown, and a search trigger.
*   **RichTextArea**: Multi-line input with support for overflow scrolling.

### C. Layout & Containers
*   **WindowsContainer**: Main application shell with a Blue-Gradient title bar (#A6CAF0).
*   **DataGrid**: A scrollable table with sticky headers, horizontal grid lines, and row-selection states.
*   **GroupBox**: A labeled border container for grouping related fields (e.g., Export options).

### D. Dialogs & Modals
*   **BaseModal**: Centered overlay with a white content area and a grey footer area (#D4D0C8).
*   **MessageDialog**: Specialized modal for short messages (Alerts/Confirmations).

## 3. Parity Guardrails
To maintain strict analyzer approval:
1.  **Strict Bevels**: All inputs must have a "sunken" appearance (`inset` shadow) and all buttons must have a "raised" appearance (`outset` border).
2.  **No Modern Spacing**: Use compact spacing (approx. 4px between related elements, 10px between groups) to mimic the high-density legacy UI.
3.  **Title Bar Parity**: Every modal must have a title bar with a matching icon and close 'X'.
