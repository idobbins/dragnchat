// Node type colors
export const NODE_COLORS = {
  text: "blue",
  image: "red",
  file: "green",
  model: "yellow",
} as const;

// Node type titles
export const NODE_TITLES = {
  text: "Text Input",
  image: "Image Input",
  file: "File Input",
  model: "Model Select",
} as const;

// Handle configuration
export const HANDLE_CONFIG = {
  size: 2, // in pixels
  borderWidth: 2, // in pixels
  borderColor: "gray-200",
};

// Default node dimensions
export const NODE_DIMENSIONS = {
  width: 32, // in rem units (8rem = 128px)
  headerHeight: 1.5, // in rem units
  contentPadding: 0.5, // in rem units
};

// Node type to color mapping
export const NODE_TYPE_CONFIG = {
  textInputNode: {
    color: NODE_COLORS.text,
    title: NODE_TITLES.text,
    showInputHandle: false,
    showOutputHandle: true,
  },
  imageInputNode: {
    color: NODE_COLORS.image,
    title: NODE_TITLES.image,
    showInputHandle: false,
    showOutputHandle: true,
  },
  fileInputNode: {
    color: NODE_COLORS.file,
    title: NODE_TITLES.file,
    showInputHandle: false,
    showOutputHandle: true,
  },
  modelSelectNode: {
    color: NODE_COLORS.model,
    title: NODE_TITLES.model,
    showInputHandle: true,
    showOutputHandle: true,
  },
} as const;
