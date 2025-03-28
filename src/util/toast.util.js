import { toast } from "react-toastify"

// Toast configuration
const defaultConfig = {
  position: "bottom-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
}

// Toast utility functions
const toastUtil = {
  success: (message) => {
    toast.success(message, defaultConfig)
  },

  error: (message) => {
    toast.error(message, defaultConfig)
  },

  info: (message) => {
    toast.info(message, defaultConfig)
  },

  warning: (message) => {
    toast.warning(message, defaultConfig)
  },

  // For custom toast configurations
  custom: (message, options) => {
    toast(message, { ...defaultConfig, ...options })
  },
}

export default toastUtil

