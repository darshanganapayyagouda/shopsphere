
export function getRoute() {
  const parts = location.hash.slice(1).split("/").filter(Boolean);

  if (parts.length === 0) {
    return { page: "home" };
  }

  if (parts[0] === "products") {
    return { page: "products" };
  }

  if (parts[0] === "product" && parts[1]) {
    return { page: "product", id: parts[1] };
  }

  if (parts[0] === "cart") {
    return { page: "cart" };
  }

  return { page: "not-found" };
}

export function navigate(path) {
  location.hash = path;
}
