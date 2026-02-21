import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, X, Plus, ImageIcon, Package, Tag, DollarSign, Search, GripVertical, Calendar, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "./ProductCard";

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: (product: Omit<Product, "id">) => void;
  categories: string[];
  allProducts?: { id: string; name: string; images: string[] | null; price: number }[];
}

const defaultProduct: Omit<Product, "id"> = {
  name: "",
  sku: "",
  price: 0,
  comparePrice: undefined,
  stock: 0,
  category: "",
  status: "draft",
  image: "",
  images: [],
  sizes: [],
  colors: [],
  description: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: [],
  publish_at: null,
  low_stock_threshold: 10,
  relatedProductIds: [],
};

const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const colorOptions = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Red", value: "#EF4444" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#22C55E" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Pink", value: "#EC4899" },
  { name: "Purple", value: "#A855F7" },
  { name: "Orange", value: "#F97316" },
  { name: "Gray", value: "#6B7280" },
];

export function ProductModal({
  open,
  onOpenChange,
  product,
  onSave,
  categories,
  allProducts = [],
}: ProductModalProps) {
  const [formData, setFormData] = useState<Omit<Product, "id">>(defaultProduct);
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [seoKeywordInput, setSeoKeywordInput] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        price: product.price,
        comparePrice: product.comparePrice,
        stock: product.stock,
        category: product.category,
        status: product.status,
        image: product.image,
        images: product.images || [],
        sizes: product.sizes || [],
        colors: product.colors || [],
        description: product.description || "",
        meta_title: product.meta_title || "",
        meta_description: product.meta_description || "",
        meta_keywords: product.meta_keywords || [],
        publish_at: product.publish_at || null,
        low_stock_threshold: product.low_stock_threshold ?? 10,
        relatedProductIds: product.relatedProductIds || [],
      });
      setImages(product.images && product.images.length > 0 ? product.images : product.image ? [product.image] : []);
    } else {
      setFormData(defaultProduct);
      setImages([]);
    }
    setErrors({});
    setSeoKeywordInput("");
  }, [product, open]);

  const updateField = <K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setImages((prev) => [...prev, result]);
          if (!formData.image) {
            updateField("image", result);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      if (index === 0 && newImages.length > 0) {
        updateField("image", newImages[0]);
      } else if (newImages.length === 0) {
        updateField("image", "");
      }
      return newImages;
    });
  };

  // 4.2 Drag to reorder images
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    setImages(prev => {
      const newImages = [...prev];
      const draggedItem = newImages[draggedIndex];
      newImages.splice(draggedIndex, 1);
      newImages.splice(index, 0, draggedItem);
      return newImages;
    });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    if (images.length > 0) {
      updateField("image", images[0]);
    }
  };

  const toggleSize = (size: string) => {
    const sizes = formData.sizes || [];
    if (sizes.includes(size)) {
      updateField("sizes", sizes.filter((s) => s !== size));
    } else {
      updateField("sizes", [...sizes, size]);
    }
  };

  const toggleColor = (color: string) => {
    const colors = formData.colors || [];
    if (colors.includes(color)) {
      updateField("colors", colors.filter((c) => c !== color));
    } else {
      updateField("colors", [...colors, color]);
    }
  };

  // SEO keyword management
  const addKeyword = () => {
    const keyword = seoKeywordInput.trim();
    if (keyword && !(formData.meta_keywords || []).includes(keyword)) {
      updateField("meta_keywords", [...(formData.meta_keywords || []), keyword]);
      setSeoKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    updateField("meta_keywords", (formData.meta_keywords || []).filter(k => k !== keyword));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (formData.price <= 0) newErrors.price = "Price must be greater than 0";
    if (!formData.category) newErrors.category = "Category is required";
    if (formData.stock < 0) newErrors.stock = "Stock cannot be negative";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave({
        ...formData,
        image: images[0] || "/placeholder.svg",
        images,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-accent" />
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            {product
              ? "Update the product details below"
              : "Fill in the details to add a new product"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic" className="text-xs">Basic</TabsTrigger>
            <TabsTrigger value="pricing" className="text-xs">Pricing</TabsTrigger>
            <TabsTrigger value="variants" className="text-xs">Variants</TabsTrigger>
            <TabsTrigger value="seo" className="text-xs">SEO</TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs">Advanced</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4 pt-4">
            {/* Image Upload with Drag-to-Reorder */}
            <div className="space-y-2">
              <Label>Product Images (drag to reorder)</Label>
              <div className="flex flex-wrap gap-3">
                {images.map((img, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "group relative h-24 w-24 overflow-hidden rounded-lg border border-border cursor-grab active:cursor-grabbing transition-transform",
                      draggedIndex === index && "opacity-50 scale-95"
                    )}
                  >
                    <div className="absolute left-1 top-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="h-4 w-4 text-foreground bg-card/80 rounded" />
                    </div>
                    <img
                      src={img}
                      alt={`Product ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {index === 0 && (
                      <Badge className="absolute bottom-1 left-1 text-xs">Main</Badge>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-24 w-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 text-muted-foreground transition-colors hover:border-accent hover:bg-accent/5"
                >
                  <Upload className="mb-1 h-5 w-5" />
                  <span className="text-xs">Upload</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Enter product name"
                className={cn(errors.name && "border-destructive")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Product description..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* SKU & Category */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => updateField("sku", e.target.value.toUpperCase())}
                  placeholder="e.g., EKT-001"
                  className={cn(errors.sku && "border-destructive")}
                />
                {errors.sku && (
                  <p className="text-xs text-destructive">{errors.sku}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => updateField("category", value)}
                >
                  <SelectTrigger className={cn(errors.category && "border-destructive")}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs text-destructive">{errors.category}</p>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Product["status"]) =>
                  updateField("status", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Pricing & Stock Tab */}
          <TabsContent value="pricing" className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Price (৳) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={formData.price || ""}
                  onChange={(e) => updateField("price", Number(e.target.value))}
                  placeholder="0"
                  className={cn(errors.price && "border-destructive")}
                />
                {errors.price && (
                  <p className="text-xs text-destructive">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="comparePrice">Compare at Price (৳)</Label>
                <Input
                  id="comparePrice"
                  type="number"
                  min="0"
                  value={formData.comparePrice || ""}
                  onChange={(e) =>
                    updateField(
                      "comparePrice",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  placeholder="Optional"
                />
                <p className="text-xs text-muted-foreground">
                  Original price before discount
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stock" className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  Stock Quantity *
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock || ""}
                  onChange={(e) => updateField("stock", Number(e.target.value))}
                  placeholder="0"
                  className={cn(errors.stock && "border-destructive")}
                />
                {errors.stock && (
                  <p className="text-xs text-destructive">{errors.stock}</p>
                )}
                {formData.stock <= (formData.low_stock_threshold ?? 10) && formData.stock > 0 && (
                  <p className="text-xs text-warning flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Below low stock threshold ({formData.low_stock_threshold})
                  </p>
                )}
                {formData.stock === 0 && (
                  <p className="text-xs text-destructive">Out of stock</p>
                )}
              </div>

              {/* 4.7 Low Stock Threshold */}
              <div className="space-y-2">
                <Label htmlFor="low_stock_threshold" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Low Stock Alert Threshold
                </Label>
                <Input
                  id="low_stock_threshold"
                  type="number"
                  min="1"
                  value={formData.low_stock_threshold ?? 10}
                  onChange={(e) => updateField("low_stock_threshold", Number(e.target.value))}
                  placeholder="10"
                />
                <p className="text-xs text-muted-foreground">
                  Alert when stock falls below this number
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Variants Tab */}
          <TabsContent value="variants" className="space-y-4 pt-4">
            {/* Sizes */}
            <div className="space-y-2">
              <Label>Available Sizes</Label>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => (
                  <Button
                    key={size}
                    type="button"
                    variant={formData.sizes?.includes(size) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-2">
              <Label>Available Colors</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => toggleColor(color.value)}
                    className={cn(
                      "h-8 w-8 rounded-full border-2 transition-all",
                      formData.colors?.includes(color.value)
                        ? "border-accent ring-2 ring-accent ring-offset-2"
                        : "border-border hover:border-muted-foreground"
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              {formData.colors && formData.colors.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {formData.colors.map((color) => {
                    const colorName = colorOptions.find((c) => c.value === color)?.name;
                    return (
                      <Badge key={color} variant="secondary" className="gap-1">
                        <div
                          className="h-3 w-3 rounded-full border border-border"
                          style={{ backgroundColor: color }}
                        />
                        {colorName}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => toggleColor(color)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground pt-2">
              💡 For per-variant stock tracking with separate SKUs and pricing, save the product first then manage variants from the product detail view.
            </p>
          </TabsContent>

          {/* 4.4 SEO Tab */}
          <TabsContent value="seo" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input
                id="meta_title"
                value={formData.meta_title || ""}
                onChange={(e) => updateField("meta_title", e.target.value)}
                placeholder="SEO title (max 60 chars)"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                {(formData.meta_title || "").length}/60 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea
                id="meta_description"
                value={formData.meta_description || ""}
                onChange={(e) => updateField("meta_description", e.target.value)}
                placeholder="SEO description (max 160 chars)"
                maxLength={160}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {(formData.meta_description || "").length}/160 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label>Meta Keywords</Label>
              <div className="flex gap-2">
                <Input
                  value={seoKeywordInput}
                  onChange={(e) => setSeoKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                  placeholder="Add keyword and press Enter"
                />
                <Button type="button" variant="outline" size="sm" onClick={addKeyword}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {(formData.meta_keywords || []).length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {(formData.meta_keywords || []).map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="gap-1">
                      {keyword}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeKeyword(keyword)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Advanced Tab - Scheduling & Related Products */}
          <TabsContent value="advanced" className="space-y-4 pt-4">
            {/* 4.5 Product Scheduling */}
            <div className="space-y-2">
              <Label htmlFor="publish_at" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Schedule Publish Date
              </Label>
              <Input
                id="publish_at"
                type="datetime-local"
                value={formData.publish_at ? new Date(formData.publish_at).toISOString().slice(0, 16) : ""}
                onChange={(e) => updateField("publish_at", e.target.value ? new Date(e.target.value).toISOString() : null)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to publish immediately. Set a future date to auto-publish.
              </p>
              {formData.publish_at && new Date(formData.publish_at) > new Date() && (
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                  <Calendar className="h-3 w-3 mr-1" />
                  Scheduled: {new Date(formData.publish_at).toLocaleString()}
                </Badge>
              )}
            </div>

            {/* 4.6 Related Products */}
            <div className="space-y-2">
              <Label>Related Products</Label>
              <p className="text-xs text-muted-foreground">
                Link related/similar products. Save the product first, then manage related products from the product list dropdown menu.
              </p>
              {allProducts.length > 0 && (
                <div className="max-h-[200px] overflow-y-auto border rounded-lg divide-y divide-border">
                  {allProducts
                    .filter(p => p.id !== product?.id)
                    .slice(0, 20)
                    .map(p => {
                      const isSelected = (formData.relatedProductIds || []).includes(p.id);
                      return (
                        <div
                          key={p.id}
                          className={cn(
                            "flex items-center gap-3 p-2 cursor-pointer hover:bg-muted/50 transition-colors",
                            isSelected && "bg-primary/5"
                          )}
                          onClick={() => {
                            const current = formData.relatedProductIds || [];
                            if (isSelected) {
                              updateField("relatedProductIds", current.filter(id => id !== p.id));
                            } else {
                              updateField("relatedProductIds", [...current, p.id]);
                            }
                          }}
                        >
                          <div className="h-8 w-8 rounded bg-muted overflow-hidden shrink-0">
                            <img
                              src={p.images?.[0] || '/placeholder.svg'}
                              alt={p.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground">৳{p.price.toLocaleString()}</p>
                          </div>
                          {isSelected && (
                            <Badge variant="secondary" className="text-xs shrink-0">Linked</Badge>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Plus className="h-4 w-4" />
            {product ? "Update Product" : "Add Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
