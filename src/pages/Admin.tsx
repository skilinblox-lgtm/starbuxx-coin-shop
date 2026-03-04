import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package, ShoppingCart, Users, MessageSquare, DollarSign,
  ArrowLeft, Truck, Shield, UserPlus, Send, Bot, Edit2, Save, X,
  Upload, BarChart3, TrendingUp, Clock, CheckCircle, XCircle, Image, Brain, Plus, Trash2, Star, FileText, Settings
} from "lucide-react";
import RarityBadge, { RARITY_CONFIG } from "@/components/RarityBadge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

type Tab = "dashboard" | "products" | "deliveries" | "moderation" | "earnings" | "moderators" | "brainrot" | "blog" | "settings";

const statusOptions = [
  { value: "aguardando_pagamento", label: "Aguardando", color: "hsl(45, 100%, 51%)" },
  { value: "pago", label: "Pago", color: "hsl(210, 80%, 55%)" },
  { value: "em_entrega", label: "Em Entrega", color: "hsl(30, 90%, 55%)" },
  { value: "entregue", label: "Entregue", color: "hsl(140, 60%, 45%)" },
  { value: "cancelado", label: "Cancelado", color: "hsl(0, 70%, 55%)" },
];

const PIE_COLORS = ["hsl(45, 100%, 51%)", "hsl(210, 80%, 55%)", "hsl(30, 90%, 55%)", "hsl(140, 60%, 45%)", "hsl(0, 70%, 55%)"];

const Admin = () => {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");
  const navigate = useNavigate();

  // Data
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [moderators, setModerators] = useState<any[]>([]);
  const [modPermissions, setModPermissions] = useState<any[]>([]);

  // Product editing
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Chat
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Moderator adding
  const [newModEmail, setNewModEmail] = useState("");
  const [addingMod, setAddingMod] = useState(false);
  const [modPerms, setModPerms] = useState({
    can_manage_products: false,
    can_manage_reviews: false,
    can_manage_users: false,
    can_process_deliveries: false,
    can_view_earnings: false,
  });

  // Brainrot
  const [brainrotPosts, setBrainrotPosts] = useState<any[]>([]);
  const [newBrainrot, setNewBrainrot] = useState({ title: "", description: "", current_price: "", rarity: "common", stock: "", tags: [] as string[] });
  const [brainrotUploading, setBrainrotUploading] = useState(false);
  const [editingBrainrot, setEditingBrainrot] = useState<string | null>(null);
  const [editBrainrotData, setEditBrainrotData] = useState({ title: "", description: "", current_price: "", rarity: "common", stock: "", tags: [] as string[] });
  const [newBrainrotImage, setNewBrainrotImage] = useState<File | null>(null);

  // Blog
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [blogComments, setBlogComments] = useState<any[]>([]);
  const [newBlog, setNewBlog] = useState({ title: "", content: "", category: "script", script_code: "", video_url: "", game_compatible: "Steal a Brainrot" });
  const [editingBlog, setEditingBlog] = useState<string | null>(null);
  const [editBlogData, setEditBlogData] = useState({ title: "", content: "", category: "script", script_code: "", video_url: "", game_compatible: "" });
  const [newBlogImage, setNewBlogImage] = useState<File | null>(null);
  const [editBlogImage, setEditBlogImage] = useState<File | null>(null);

  // Settings
  const [robuxPrice, setRobuxPrice] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setCurrentUserId(session.user.id);
      const { data } = await supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" });
      if (!data) { toast.error("Acesso negado"); navigate("/"); return; }
      setIsAdmin(true);
      setLoading(false);
      fetchAll();
      fetchSettings();
    };
    checkAdmin();
  }, [navigate]);

  const fetchAll = useCallback(async () => {
    const [o, p, r, u, roles, perms, br, bl, bc] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("name"),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*").eq("role", "moderator"),
      supabase.from("moderator_permissions").select("*"),
      supabase.from("brainrot_posts").select("*").order("created_at", { ascending: false }),
      supabase.from("blog_posts").select("*").order("created_at", { ascending: false }),
      supabase.from("blog_comments").select("*").order("created_at", { ascending: false }),
    ]);
    setOrders(o.data || []);
    setProducts(p.data || []);
    setReviews(r.data || []);
    setProfiles(u.data || []);
    setModerators(roles.data || []);
    setModPermissions(perms.data || []);
    setBrainrotPosts(br.data || []);
    setBlogPosts(bl.data || []);
    setBlogComments(bc.data || []);
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from("site_settings").select("*").eq("key", "robux_price_per_1000").single();
    if (data) setRobuxPrice(data.value);
  };

  const saveRobuxPrice = async () => {
    if (!robuxPrice) return;
    setSavingSettings(true);
    try {
      const { error } = await supabase.from("site_settings").update({ value: robuxPrice, updated_at: new Date().toISOString() } as any).eq("key", "robux_price_per_1000");
      if (error) throw error;
      toast.success("Valor do Robux atualizado! Todos os preços foram sincronizados.");
    } catch (e: any) { toast.error(e.message); }
    finally { setSavingSettings(false); }
  };

  // Chat realtime subscription
  useEffect(() => {
    if (!selectedOrder) return;
    const channel = supabase
      .channel(`chat-${selectedOrder.id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "chat_messages",
        filter: `order_id=eq.${selectedOrder.id}`,
      }, (payload) => {
        setChatMessages(prev => [...prev, payload.new]);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedOrder]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const fetchChatMessages = async (orderId: string) => {
    const { data } = await supabase.from("chat_messages").select("*").eq("order_id", orderId).order("created_at", { ascending: true });
    setChatMessages(data || []);
  };

  const openChat = (order: any) => { setSelectedOrder(order); fetchChatMessages(order.id); };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !selectedOrder) return;
    setSendingChat(true);
    const msg = chatInput;
    setChatInput("");
    try {
      await supabase.from("chat_messages").insert({ order_id: selectedOrder.id, sender_id: currentUserId, sender_role: "admin", message: msg });
    } catch (e: any) { toast.error(e.message); } finally { setSendingChat(false); }
  };

  const triggerAiResponse = async (orderId: string) => {
    if (!aiEnabled) return;
    const lastCustomerMsg = chatMessages.filter(m => m.sender_role === "customer").pop();
    if (!lastCustomerMsg) return;
    try {
      await supabase.functions.invoke("chat-ai", { body: { orderId, message: lastCustomerMsg.message, chatHistory: chatMessages.slice(-10) } });
    } catch (e: any) { console.error("AI error:", e); }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const updateData: any = { status };
    if (status === "pago") updateData.payment_approved_at = new Date().toISOString();
    const { error } = await supabase.from("orders").update(updateData).eq("id", orderId);
    if (error) { toast.error(error.message); return; }
    toast.success("Status atualizado!");
    fetchAll();
  };

  const startEditProduct = (p: any) => { setEditingProduct(p.id); setEditName(p.name); setEditPrice(String(p.price_per_unit)); };

  const saveProduct = async (id: string) => {
    const { error } = await supabase.from("products").update({ name: editName, price_per_unit: parseFloat(editPrice) }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Produto atualizado!"); setEditingProduct(null); fetchAll();
  };

  const toggleProduct = async (id: string, active: boolean) => {
    await supabase.from("products").update({ active: !active }).eq("id", id);
    toast.success("Produto atualizado!"); fetchAll();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto permanentemente?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Produto excluído!"); fetchAll();
  };

  const uploadProductImage = async (productId: string, file: File) => {
    setUploadingImage(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${productId}.${ext}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
      await supabase.from("products").update({ image_url: publicUrl }).eq("id", productId);
      toast.success("Imagem atualizada!"); fetchAll();
    } catch (e: any) { toast.error(e.message); } finally { setUploadingImage(false); }
  };

  const deleteReview = async (id: string) => { await supabase.from("reviews").delete().eq("id", id); toast.success("Avaliação removida!"); fetchAll(); };

  const addModerator = async () => {
    if (!newModEmail.trim()) return;
    setAddingMod(true);
    try {
      const { data: userOrders } = await supabase.from("orders").select("user_id, discord_username").eq("discord_username", newModEmail).limit(1);
      let userId: string | null = null;
      if (userOrders && userOrders.length > 0) userId = userOrders[0].user_id;
      if (!userId) { toast.error("Usuário não encontrado."); return; }
      const { error: roleErr } = await supabase.from("user_roles").insert({ user_id: userId, role: "moderator" });
      if (roleErr) { if (roleErr.message.includes("duplicate")) toast.error("Já é moderador"); else throw roleErr; return; }
      await supabase.from("moderator_permissions").insert({ user_id: userId, ...modPerms });
      toast.success("Moderador adicionado!");
      setNewModEmail("");
      setModPerms({ can_manage_products: false, can_manage_reviews: false, can_manage_users: false, can_process_deliveries: false, can_view_earnings: false });
      fetchAll();
    } catch (e: any) { toast.error(e.message); } finally { setAddingMod(false); }
  };

  const removeModerator = async (userId: string) => {
    await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "moderator");
    await supabase.from("moderator_permissions").delete().eq("user_id", userId);
    toast.success("Moderador removido!"); fetchAll();
  };

  // Brainrot functions
  const createBrainrot = async () => {
    if (!newBrainrot.title || !newBrainrot.current_price) { toast.error("Preencha título e preço"); return; }
    try {
      const { data, error } = await supabase.from("brainrot_posts").insert({
        title: newBrainrot.title,
        description: newBrainrot.description,
        current_price: parseFloat(newBrainrot.current_price),
        rarity: newBrainrot.rarity,
        stock: parseInt(newBrainrot.stock) || 0,
        tags: newBrainrot.tags,
      } as any).select().single();
      if (error) throw error;
      // Upload image if provided
      if (newBrainrotImage && data) {
        const ext = newBrainrotImage.name.split(".").pop();
        const path = `${data.id}.${ext}`;
        await supabase.storage.from("brainrot-images").upload(path, newBrainrotImage, { upsert: true });
        const { data: { publicUrl } } = supabase.storage.from("brainrot-images").getPublicUrl(path);
        await supabase.from("brainrot_posts").update({ image_url: publicUrl }).eq("id", data.id);
      }
      // Add initial price history
      await supabase.from("brainrot_price_history").insert({
        brainrot_id: data.id,
        price: parseFloat(newBrainrot.current_price),
      });
      toast.success("Brainrot publicado!");
      setNewBrainrot({ title: "", description: "", current_price: "", rarity: "common", stock: "", tags: [] });
      setNewBrainrotImage(null);
      fetchAll();
    } catch (e: any) { toast.error(e.message); }
  };

  const uploadBrainrotImage = async (brainrotId: string, file: File) => {
    setBrainrotUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${brainrotId}.${ext}`;
      const { error: upErr } = await supabase.storage.from("brainrot-images").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("brainrot-images").getPublicUrl(path);
      await supabase.from("brainrot_posts").update({ image_url: publicUrl }).eq("id", brainrotId);
      toast.success("Imagem atualizada!"); fetchAll();
    } catch (e: any) { toast.error(e.message); } finally { setBrainrotUploading(false); }
  };

  const saveBrainrotEdit = async (id: string) => {
    const price = parseFloat(editBrainrotData.current_price);
    if (isNaN(price) || !editBrainrotData.title) return;
    try {
      const oldPost = brainrotPosts.find(p => p.id === id);
      await supabase.from("brainrot_posts").update({
        title: editBrainrotData.title,
        description: editBrainrotData.description,
        current_price: price,
        rarity: editBrainrotData.rarity,
        stock: parseInt(editBrainrotData.stock) || 0,
        tags: editBrainrotData.tags,
      } as any).eq("id", id);
      // Add price history if price changed
      if (oldPost && Number(oldPost.current_price) !== price) {
        await supabase.from("brainrot_price_history").insert({ brainrot_id: id, price });
      }
      toast.success("Brainrot atualizado!");
      setEditingBrainrot(null);
      fetchAll();
    } catch (e: any) { toast.error(e.message); }
  };

  const deleteBrainrot = async (id: string) => {
    await supabase.from("brainrot_posts").delete().eq("id", id);
    toast.success("Brainrot removido!"); fetchAll();
  };

  // Blog functions
  const createBlogPost = async () => {
    if (!newBlog.title || !newBlog.content) { toast.error("Preencha título e conteúdo"); return; }
    try {
      const { data, error } = await supabase.from("blog_posts").insert({
        title: newBlog.title, content: newBlog.content, category: newBlog.category,
        script_code: newBlog.script_code || null, video_url: newBlog.video_url || null,
        game_compatible: newBlog.game_compatible || null, author: "skilin",
      } as any).select().single();
      if (error) throw error;
      if (newBlogImage && data) {
        const ext = newBlogImage.name.split(".").pop();
        const path = `blog-${data.id}.${ext}`;
        await supabase.storage.from("product-images").upload(path, newBlogImage, { upsert: true });
        const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
        await supabase.from("blog_posts").update({ image_url: publicUrl } as any).eq("id", data.id);
      }
      toast.success("Post publicado!");
      setNewBlog({ title: "", content: "", category: "script", script_code: "", video_url: "", game_compatible: "Steal a Brainrot" });
      setNewBlogImage(null);
      fetchAll();
    } catch (e: any) { toast.error(e.message); }
  };

  const saveBlogEdit = async (id: string) => {
    if (!editBlogData.title || !editBlogData.content) return;
    try {
      await supabase.from("blog_posts").update({
        title: editBlogData.title, content: editBlogData.content, category: editBlogData.category,
        script_code: editBlogData.script_code || null, video_url: editBlogData.video_url || null,
        game_compatible: editBlogData.game_compatible || null,
      } as any).eq("id", id);
      // Upload new image if provided
      if (editBlogImage) {
        const ext = editBlogImage.name.split(".").pop();
        const path = `blog-${id}.${ext}`;
        await supabase.storage.from("product-images").upload(path, editBlogImage, { upsert: true });
        const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
        await supabase.from("blog_posts").update({ image_url: publicUrl } as any).eq("id", id);
      }
      toast.success("Post atualizado!");
      setEditingBlog(null);
      setEditBlogImage(null);
      fetchAll();
    } catch (e: any) { toast.error(e.message); }
  };

  const deleteBlogPost = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este post permanentemente?")) return;
    try {
      await supabase.from("blog_comments").delete().eq("post_id", id);
      await supabase.from("blog_posts").delete().eq("id", id);
      toast.success("Post removido!"); fetchAll();
    } catch (e: any) { toast.error(e.message); }
  };

  const deleteBlogImage = async (id: string) => {
    try {
      await supabase.from("blog_posts").update({ image_url: null } as any).eq("id", id);
      toast.success("Imagem removida!");
      fetchAll();
    } catch (e: any) { toast.error(e.message); }
  };

  const uploadBlogImage = async (postId: string, file: File) => {
    try {
      const ext = file.name.split(".").pop();
      const path = `blog-${postId}.${ext}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
      await supabase.from("blog_posts").update({ image_url: publicUrl } as any).eq("id", postId);
      toast.success("Imagem atualizada!");
      fetchAll();
    } catch (e: any) { toast.error(e.message); }
  };

  const deleteBlogComment = async (id: string) => {
    try {
      await supabase.from("blog_comments").delete().eq("id", id);
      toast.success("Comentário removido!");
      fetchAll();
    } catch (e: any) { toast.error(e.message); }
  };

  const toggleBlogPublished = async (id: string, published: boolean) => {
    await supabase.from("blog_posts").update({ published: !published } as any).eq("id", id);
    toast.success(published ? "Post despublicado" : "Post publicado!");
    fetchAll();
  };

  // Rarity helpers removed - using RarityBadge component instead

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-dark">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Carregando painel...</p>
      </div>
    </div>
  );
  if (!isAdmin) return null;

  // Dashboard data
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const weekAgo = new Date(today.getTime() - 7 * 86400000);
  const monthAgo = new Date(today.getTime() - 30 * 86400000);

  const ordersToday = orders.filter(o => o.created_at.startsWith(todayStr));
  const ordersWeek = orders.filter(o => new Date(o.created_at) >= weekAgo);
  const ordersMonth = orders.filter(o => new Date(o.created_at) >= monthAgo);

  const revenueToday = ordersToday.filter(o => o.status !== "cancelado").reduce((s, o) => s + Number(o.total_price), 0);
  const revenueWeek = ordersWeek.filter(o => o.status !== "cancelado").reduce((s, o) => s + Number(o.total_price), 0);
  const revenueMonth = ordersMonth.filter(o => o.status !== "cancelado").reduce((s, o) => s + Number(o.total_price), 0);
  const totalRevenue = orders.filter(o => o.status !== "cancelado").reduce((s, o) => s + Number(o.total_price), 0);

  const pendingOrders = orders.filter(o => o.status === "aguardando_pagamento").length;
  const paidOrders = orders.filter(o => o.status === "pago").length;
  const deliveryOrders = orders.filter(o => o.status === "em_entrega").length;
  const deliveredOrders = orders.filter(o => o.status === "entregue").length;
  const cancelledOrders = orders.filter(o => o.status === "cancelado").length;

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today.getTime() - (6 - i) * 86400000);
    const ds = d.toISOString().split("T")[0];
    const dayOrders = orders.filter(o => o.created_at.startsWith(ds) && o.status !== "cancelado");
    return { day: d.toLocaleDateString("pt-BR", { weekday: "short" }), receita: dayOrders.reduce((s, o) => s + Number(o.total_price), 0), pedidos: dayOrders.length };
  });

  const pieData = [
    { name: "Aguardando", value: pendingOrders },
    { name: "Pago", value: paidOrders },
    { name: "Em Entrega", value: deliveryOrders },
    { name: "Entregue", value: deliveredOrders },
    { name: "Cancelado", value: cancelledOrders },
  ].filter(d => d.value > 0);

  const deliveryQueue = orders.filter(o => o.status === "pago" || o.status === "em_entrega");

  const tabs = [
    { id: "dashboard" as Tab, label: "Dashboard", icon: BarChart3 },
    { id: "products" as Tab, label: "Produtos", icon: Package },
    { id: "deliveries" as Tab, label: "Entregas", icon: Truck },
    { id: "brainrot" as Tab, label: "Brainrot", icon: Brain },
    { id: "blog" as Tab, label: "Blog/Scripts", icon: FileText },
    { id: "moderation" as Tab, label: "Moderação", icon: Shield },
    { id: "earnings" as Tab, label: "Ganhos", icon: DollarSign },
    { id: "moderators" as Tab, label: "Moderadores", icon: UserPlus },
    { id: "settings" as Tab, label: "Configurações", icon: Settings },
  ];

  const getProfileName = (userId: string) => {
    const p = profiles.find(p => p.user_id === userId);
    return p?.full_name || "Sem nome";
  };

  return (
    <div className="admin-dark min-h-screen bg-background">
      <nav className="border-b border-border/50 bg-background">
        <div className="container flex h-14 items-center justify-between px-4 sm:h-16">
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-heading text-base font-bold text-[hsl(0,0%,100%)] sm:text-xl">
              Star<span className="text-gradient-gold">Buxx</span>
              <span className="ml-1.5 text-xs font-normal text-muted-foreground sm:text-sm">Admin</span>
            </span>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[hsl(0,0%,100%)] sm:gap-2 sm:text-sm">
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Voltar ao Site</span>
            <span className="sm:hidden">Voltar</span>
          </Link>
        </div>
      </nav>

      <div className="container px-4 py-4 sm:py-6">
        <div className="flex gap-1 overflow-x-auto pb-2 sm:gap-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSelectedOrder(null); }}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all sm:gap-2 sm:px-4 sm:py-2 sm:text-sm ${
                tab === t.id ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-surface"
              }`}
            >
              <t.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {t.label}
            </button>
          ))}
        </div>

        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="mt-4 sm:mt-6">

          {/* ====== DASHBOARD ====== */}
          {tab === "dashboard" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
                <StatCard icon={DollarSign} label="Hoje" value={`R$ ${revenueToday.toFixed(2)}`} gradient />
                <StatCard icon={TrendingUp} label="Semana" value={`R$ ${revenueWeek.toFixed(2)}`} />
                <StatCard icon={BarChart3} label="Mês" value={`R$ ${revenueMonth.toFixed(2)}`} />
                <StatCard icon={DollarSign} label="Total" value={`R$ ${totalRevenue.toFixed(2)}`} gradient />
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-4">
                <MiniStat label="Pendentes" value={pendingOrders} color="hsl(45, 100%, 51%)" />
                <MiniStat label="Pagos" value={paidOrders} color="hsl(210, 80%, 55%)" />
                <MiniStat label="Entrega" value={deliveryOrders} color="hsl(30, 90%, 55%)" />
                <MiniStat label="Entregues" value={deliveredOrders} color="hsl(140, 60%, 45%)" />
                <MiniStat label="Cancelados" value={cancelledOrders} color="hsl(0, 70%, 55%)" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-border bg-background p-4 sm:p-6">
                  <h3 className="font-heading text-sm font-bold sm:text-base">Receita - Últimos 7 dias</h3>
                  <div className="mt-4 h-48 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(220, 10%, 60%)" }} />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(220, 10%, 60%)" }} />
                        <Tooltip contentStyle={{ background: "hsl(220, 20%, 14%)", border: "1px solid hsl(220, 15%, 20%)", borderRadius: 12, fontSize: 12 }} labelStyle={{ color: "hsl(0, 0%, 100%)" }} />
                        <Bar dataKey="receita" fill="hsl(45, 100%, 51%)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4 sm:p-6">
                  <h3 className="font-heading text-sm font-bold sm:text-base">Status dos Pedidos</h3>
                  <div className="mt-4 h-48 sm:h-64">
                    {pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                            {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sem dados</div>}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                <QuickLink icon={Truck} label={`${deliveryQueue.length} entregas pendentes`} onClick={() => setTab("deliveries")} />
                <QuickLink icon={Package} label={`${products.length} produtos`} onClick={() => setTab("products")} />
                <QuickLink icon={Users} label={`${profiles.length} clientes`} onClick={() => setTab("moderation")} />
              </div>
            </div>
          )}

          {/* ====== PRODUCTS ====== */}
          {tab === "products" && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="font-heading text-lg font-bold sm:text-xl">Gerenciar Produtos</h2>
              
              {/* Create product */}
              <CreateProductForm onCreated={fetchAll} />
              
              <div className="space-y-2 sm:space-y-3">
              {products.map(p => (
                <motion.div key={p.id} layout className="rounded-2xl border border-border bg-background p-3 sm:p-5">
                  {editingProduct === p.id ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        {p.image_url && <img src={p.image_url} alt="" className="h-12 w-12 rounded-lg object-contain" />}
                        <div className="flex-1 space-y-2">
                          <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary" placeholder="Nome" />
                          <div className="flex gap-2">
                            <input type="number" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-32 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary" placeholder="Preço" />
                            <span className="flex items-center text-xs text-muted-foreground">/unidade</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-muted-foreground hover:border-primary sm:text-sm">
                          <Upload className="h-3.5 w-3.5" /> {uploadingImage ? "Enviando..." : "Trocar Imagem"}
                          <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadProductImage(p.id, f); }} />
                        </label>
                        <div className="ml-auto flex gap-2">
                          <button onClick={() => setEditingProduct(null)} className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
                          <button onClick={() => saveProduct(p.id)} className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground"><Save className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="h-12 w-12 rounded-lg object-contain sm:h-14 sm:w-14" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface text-muted-foreground sm:h-14 sm:w-14"><Image className="h-5 w-5" /></div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold sm:text-base">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.currency} • R$ {Number(p.price_per_unit).toFixed(2)}/un • {p.game_id}</p>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <button onClick={() => startEditProduct(p)} className="rounded-lg border border-border p-2 text-muted-foreground hover:border-primary hover:text-primary"><Edit2 className="h-3.5 w-3.5" /></button>
                        <button onClick={() => toggleProduct(p.id, p.active)}
                          className={`rounded-full px-3 py-1 text-[10px] font-bold sm:px-4 sm:py-1.5 sm:text-xs ${p.active ? "bg-[hsl(140,60%,45%)]/10 text-[hsl(140,60%,45%)]" : "bg-[hsl(0,70%,55%)]/10 text-[hsl(0,70%,55%)]"}`}>
                          {p.active ? "Ativo" : "Inativo"}
                        </button>
                        <button onClick={() => deleteProduct(p.id)} className="rounded-lg border border-destructive/30 p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              {products.length === 0 && <EmptyState text="Nenhum produto cadastrado." />}
              </div>
            </div>
          )}

          {/* ====== DELIVERIES + CHAT ====== */}
          {tab === "deliveries" && (
            <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
              <div className={`space-y-2 sm:space-y-3 ${selectedOrder ? "hidden lg:block lg:w-1/2" : "w-full"}`}>
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-lg font-bold sm:text-xl">Fila de Entregas</h2>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{deliveryQueue.length} pendentes</span>
                </div>
                {deliveryQueue.map(o => (
                  <motion.div key={o.id} whileHover={{ x: 2 }} onClick={() => openChat(o)}
                    className={`cursor-pointer rounded-2xl border p-3 transition-all sm:p-4 ${selectedOrder?.id === o.id ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{o.full_name}</p>
                        <p className="text-xs text-muted-foreground">{o.game_id} • {o.quantity} un • {o.game_username}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-gradient-gold">R$ {Number(o.total_price).toFixed(2)}</span>
                        <select value={o.status} onChange={e => { e.stopPropagation(); updateOrderStatus(o.id, e.target.value); }} onClick={e => e.stopPropagation()}
                          className="rounded-lg border border-border bg-surface px-2 py-0.5 text-[10px] text-foreground sm:text-xs">
                          {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {deliveryQueue.length === 0 && <EmptyState text="Nenhuma entrega pendente." />}
              </div>

              {selectedOrder && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col rounded-2xl border border-border bg-background lg:w-1/2" style={{ height: "calc(100vh - 200px)", minHeight: 400 }}>
                  <div className="flex items-center justify-between border-b border-border p-3 sm:p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{selectedOrder.full_name}</p>
                      <p className="text-xs text-muted-foreground">{selectedOrder.game_id} • {selectedOrder.quantity} un</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setAiEnabled(!aiEnabled)}
                        className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium sm:text-xs ${aiEnabled ? "bg-primary/10 text-primary" : "bg-surface text-muted-foreground"}`}>
                        <Bot className="h-3 w-3" /> IA {aiEnabled ? "ON" : "OFF"}
                      </button>
                      <button onClick={() => setSelectedOrder(null)} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground lg:hidden"><X className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                    <div className="space-y-3">
                      {chatMessages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
                          <p className="mt-2 text-xs text-muted-foreground">Nenhuma mensagem ainda</p>
                          {aiEnabled && (
                            <button onClick={() => triggerAiResponse(selectedOrder.id)}
                              className="mt-3 flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
                              <Bot className="h-3.5 w-3.5" /> Enviar saudação IA
                            </button>
                          )}
                        </div>
                      )}
                      {chatMessages.map(m => (
                        <div key={m.id} className={`flex ${m.sender_role === "customer" ? "justify-start" : "justify-end"}`}>
                          <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs sm:text-sm ${
                            m.sender_role === "customer" ? "bg-surface text-foreground"
                              : m.sender_role === "ai" ? "bg-primary/10 text-foreground border border-primary/20"
                              : "bg-primary text-primary-foreground"
                          }`}>
                            {m.sender_role === "ai" && <span className="mb-1 flex items-center gap-1 text-[10px] font-medium text-primary"><Bot className="h-3 w-3" /> IA</span>}
                            <div className="prose prose-sm max-w-none dark:prose-invert"><ReactMarkdown>{m.message}</ReactMarkdown></div>
                            <p className="mt-1 text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                  </div>
                  <div className="border-t border-border p-3 sm:p-4">
                    <div className="flex gap-2">
                      <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChatMessage()}
                        placeholder="Digite sua mensagem..." className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                      <button onClick={sendChatMessage} disabled={sendingChat || !chatInput.trim()} className="rounded-xl bg-primary px-3 py-2 text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4" /></button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* ====== BRAINROT ====== */}
          {tab === "brainrot" && (
            <div className="space-y-6">
              <h2 className="font-heading text-lg font-bold sm:text-xl">Gerenciar Brainrot</h2>

              {/* Create new */}
              <div className="rounded-2xl border border-border bg-background p-4 sm:p-6">
                <h3 className="flex items-center gap-2 text-sm font-bold sm:text-base"><Plus className="h-4 w-4 text-primary" /> Publicar Novo Brainrot</h3>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <input value={newBrainrot.title} onChange={e => setNewBrainrot(p => ({ ...p, title: e.target.value }))}
                    placeholder="Título (ex: Italian Brainrot)" className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
                  <input type="number" step="0.01" value={newBrainrot.current_price} onChange={e => setNewBrainrot(p => ({ ...p, current_price: e.target.value }))}
                    placeholder="Preço inicial (R$)" className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
                  <input type="number" value={newBrainrot.stock} onChange={e => setNewBrainrot(p => ({ ...p, stock: e.target.value }))}
                    placeholder="Estoque (qtd)" className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
                  <select value={newBrainrot.rarity} onChange={e => setNewBrainrot(p => ({ ...p, rarity: e.target.value }))}
                    className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                    {Object.entries(RARITY_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
                {/* Tags (multi-select) */}
                <div className="mt-3">
                  <p className="text-xs font-bold text-muted-foreground mb-1.5">Tags adicionais (ex: Ouro + Divino)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(RARITY_CONFIG).map(([key, cfg]) => (
                      <button key={key} type="button"
                        onClick={() => setNewBrainrot(p => ({
                          ...p,
                          tags: p.tags.includes(key) ? p.tags.filter(t => t !== key) : [...p.tags, key]
                        }))}
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-bold transition-all ${
                          newBrainrot.tags.includes(key)
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border bg-surface text-muted-foreground hover:border-primary/30"
                        }`}
                      >{cfg.label}</button>
                    ))}
                  </div>
                </div>
                <textarea value={newBrainrot.description} onChange={e => setNewBrainrot(p => ({ ...p, description: e.target.value }))}
                  placeholder="Descrição (opcional)" rows={2}
                  className="mt-3 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-medium text-muted-foreground hover:border-primary sm:text-sm">
                    <Upload className="h-4 w-4" /> {newBrainrotImage ? newBrainrotImage.name : "Imagem do brainrot"}
                    <input type="file" accept="image/*" className="hidden" onChange={e => setNewBrainrotImage(e.target.files?.[0] || null)} />
                  </label>
                  <button onClick={createBrainrot} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground">Publicar</button>
                </div>
              </div>

              {/* List */}
              <div className="space-y-2 sm:space-y-3">
                {brainrotPosts.map(post => (
                  <div key={post.id} className="rounded-2xl border border-border bg-background p-3 sm:p-5">
                    {editingBrainrot === post.id ? (
                      /* ── Edit Mode ── */
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <input value={editBrainrotData.title} onChange={e => setEditBrainrotData(p => ({ ...p, title: e.target.value }))}
                            placeholder="Título" className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
                          <input type="number" step="0.01" value={editBrainrotData.current_price} onChange={e => setEditBrainrotData(p => ({ ...p, current_price: e.target.value }))}
                            placeholder="Preço (R$)" className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <input type="number" value={editBrainrotData.stock} onChange={e => setEditBrainrotData(p => ({ ...p, stock: e.target.value }))}
                            placeholder="Estoque (qtd)" className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
                          <select value={editBrainrotData.rarity} onChange={e => setEditBrainrotData(p => ({ ...p, rarity: e.target.value }))}
                            className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                            {Object.entries(RARITY_CONFIG).map(([key, cfg]) => (
                              <option key={key} value={key}>{cfg.label}</option>
                            ))}
                          </select>
                          <textarea value={editBrainrotData.description} onChange={e => setEditBrainrotData(p => ({ ...p, description: e.target.value }))}
                            placeholder="Descrição" rows={1} className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
                        </div>
                        {/* Edit tags */}
                        <div>
                          <p className="text-xs font-bold text-muted-foreground mb-1">Tags adicionais</p>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(RARITY_CONFIG).map(([key, cfg]) => (
                              <button key={key} type="button"
                                onClick={() => setEditBrainrotData(p => ({
                                  ...p,
                                  tags: p.tags.includes(key) ? p.tags.filter(t => t !== key) : [...p.tags, key]
                                }))}
                                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold transition-all ${
                                  editBrainrotData.tags.includes(key)
                                    ? "border-primary bg-primary/15 text-primary"
                                    : "border-border bg-surface text-muted-foreground hover:border-primary/30"
                                }`}
                              >{cfg.label}</button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => saveBrainrotEdit(post.id)} className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground">
                            <Save className="mr-1.5 inline h-3.5 w-3.5" /> Salvar
                          </button>
                          <button onClick={() => setEditingBrainrot(null)} className="rounded-xl border border-border px-5 py-2 text-xs font-medium text-muted-foreground hover:bg-surface">
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── View Mode ── */
                      <div className="flex items-center gap-3">
                        {post.image_url ? (
                          <img src={post.image_url} alt={post.title} className="h-14 w-14 rounded-xl object-cover sm:h-16 sm:w-16" />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface text-2xl sm:h-16 sm:w-16">🧠</div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-sm font-bold sm:text-base">{post.title}</p>
                            {post.featured && <Star className="h-3.5 w-3.5 fill-primary text-primary" />}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1">
                            <RarityBadge rarity={post.rarity || 'common'} />
                            {(post.tags || []).filter((t: string) => t !== post.rarity).map((tag: string) => (
                              <RarityBadge key={tag} rarity={tag} />
                            ))}
                          </div>
                          <p className="mt-1 flex items-center gap-2 text-sm font-bold text-gradient-gold">R$ {Number(post.current_price).toFixed(2)} <span className="text-xs font-normal text-muted-foreground">• Estoque: {post.stock ?? 0}</span></p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <button onClick={async () => {
                            await supabase.from("brainrot_posts").update({ featured: !post.featured } as any).eq("id", post.id);
                            toast.success(post.featured ? "Destaque removido" : "Destacado!");
                            fetchAll();
                          }} className={`flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[10px] font-medium sm:text-xs ${
                            post.featured ? "border-primary bg-primary/15 text-primary" : "border-border bg-surface text-muted-foreground hover:border-primary"
                          }`}>
                            <Star className={`h-3 w-3 ${post.featured ? "fill-primary" : ""}`} /> {post.featured ? "★" : "Destaque"}
                          </button>
                          <button onClick={() => {
                            setEditingBrainrot(post.id);
                            setEditBrainrotData({
                              title: post.title,
                              description: post.description || "",
                              current_price: String(post.current_price),
                              rarity: post.rarity || "common",
                              stock: String(post.stock ?? 0),
                              tags: post.tags || [],
                            });
                          }} className="flex items-center justify-center gap-1 rounded-lg border border-border bg-surface px-2 py-1.5 text-[10px] font-medium text-muted-foreground hover:border-primary sm:text-xs">
                            <Edit2 className="h-3 w-3" /> Editar
                          </button>
                          <label className="flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1.5 text-[10px] font-medium text-muted-foreground hover:border-primary sm:text-xs">
                            <Upload className="h-3 w-3" /> {brainrotUploading ? "..." : "Foto"}
                            <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadBrainrotImage(post.id, f); }} />
                          </label>
                          <button onClick={() => deleteBrainrot(post.id)} className="flex items-center justify-center gap-1 rounded-lg border border-destructive/30 px-2 py-1.5 text-[10px] text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {brainrotPosts.length === 0 && <EmptyState text="Nenhum brainrot publicado ainda." />}
              </div>
            </div>
          )}

          {/* ====== BLOG ====== */}
          {tab === "blog" && (
            <div className="space-y-6">
              <h2 className="font-heading text-lg font-bold sm:text-xl">Gerenciar Blog / Scripts</h2>

              {/* Create */}
              <div className="rounded-2xl border border-border bg-background p-4 sm:p-6">
                <h3 className="flex items-center gap-2 text-sm font-bold sm:text-base"><Plus className="h-4 w-4 text-primary" /> Novo Post</h3>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input value={newBlog.title} onChange={e => setNewBlog(p => ({ ...p, title: e.target.value }))}
                    placeholder="Título do post" className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
                  <select value={newBlog.category} onChange={e => setNewBlog(p => ({ ...p, category: e.target.value }))}
                    className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                    <option value="script">Script</option>
                    <option value="executor">Executor</option>
                    <option value="tutorial">Tutorial</option>
                  </select>
                  <input value={newBlog.game_compatible} onChange={e => setNewBlog(p => ({ ...p, game_compatible: e.target.value }))}
                    placeholder="Jogo compatível (ex: Steal a Brainrot)" className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
                  <input value={newBlog.video_url} onChange={e => setNewBlog(p => ({ ...p, video_url: e.target.value }))}
                    placeholder="URL do vídeo (YouTube)" className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
                </div>
                <textarea value={newBlog.content} onChange={e => setNewBlog(p => ({ ...p, content: e.target.value }))}
                  placeholder="Descrição do script (suporta Markdown)" rows={4}
                  className="mt-3 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary font-mono" />
                <textarea value={newBlog.script_code} onChange={e => setNewBlog(p => ({ ...p, script_code: e.target.value }))}
                  placeholder="Código do Script (cole o loadstring aqui)" rows={3}
                  className="mt-3 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary font-mono text-xs" />
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-medium text-muted-foreground hover:border-primary sm:text-sm">
                    <Upload className="h-4 w-4" /> {newBlogImage ? newBlogImage.name : "Imagem de capa"}
                    <input type="file" accept="image/*" className="hidden" onChange={e => setNewBlogImage(e.target.files?.[0] || null)} />
                  </label>
                  <button onClick={createBlogPost} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground">Publicar</button>
                </div>
              </div>

              {/* List */}
              <div className="space-y-2 sm:space-y-3">
                {blogPosts.map(post => (
                  <div key={post.id} className="rounded-2xl border border-border bg-background p-3 sm:p-5">
                    {editingBlog === post.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <input value={editBlogData.title} onChange={e => setEditBlogData(p => ({ ...p, title: e.target.value }))}
                            placeholder="Título" className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
                          <select value={editBlogData.category} onChange={e => setEditBlogData(p => ({ ...p, category: e.target.value }))}
                            className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                            <option value="script">Script</option>
                            <option value="executor">Executor</option>
                            <option value="tutorial">Tutorial</option>
                          </select>
                          <input value={editBlogData.game_compatible} onChange={e => setEditBlogData(p => ({ ...p, game_compatible: e.target.value }))}
                            placeholder="Jogo compatível" className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
                          <input value={editBlogData.video_url} onChange={e => setEditBlogData(p => ({ ...p, video_url: e.target.value }))}
                            placeholder="URL do vídeo (YouTube)" className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
                        </div>
                        <textarea value={editBlogData.content} onChange={e => setEditBlogData(p => ({ ...p, content: e.target.value }))}
                          placeholder="Descrição" rows={3} className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary font-mono" />
                        <textarea value={editBlogData.script_code} onChange={e => setEditBlogData(p => ({ ...p, script_code: e.target.value }))}
                          placeholder="Código do Script" rows={2} className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary font-mono text-xs" />
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-muted-foreground hover:border-primary">
                            <Upload className="h-3.5 w-3.5" /> {editBlogImage ? editBlogImage.name : "Trocar Imagem"}
                            <input type="file" accept="image/*" className="hidden" onChange={e => setEditBlogImage(e.target.files?.[0] || null)} />
                          </label>
                          {post.image_url && (
                            <button onClick={() => deleteBlogImage(post.id)} className="flex items-center gap-1 rounded-xl border border-destructive/30 px-3 py-2 text-xs text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-3 w-3" /> Remover Imagem
                            </button>
                          )}
                          <div className="ml-auto flex gap-2">
                            <button onClick={() => { setEditingBlog(null); setEditBlogImage(null); }} className="rounded-xl border border-border px-5 py-2 text-xs font-medium text-muted-foreground hover:bg-surface">
                              Cancelar
                            </button>
                            <button onClick={() => saveBlogEdit(post.id)} className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground">
                              <Save className="mr-1.5 inline h-3.5 w-3.5" /> Salvar
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        {post.image_url ? (
                          <img src={post.image_url} alt={post.title} className="h-14 w-14 rounded-xl object-cover sm:h-16 sm:w-16" />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface text-muted-foreground sm:h-16 sm:w-16"><FileText className="h-6 w-6" /></div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold sm:text-base">{post.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {post.category === "executor" ? "Executor" : post.category === "tutorial" ? "Tutorial" : "Script"} • {new Date(post.created_at).toLocaleDateString("pt-BR")}
                          </p>
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{post.content.substring(0, 80)}...</p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <button onClick={() => toggleBlogPublished(post.id, post.published)}
                            className={`rounded-lg border px-2 py-1.5 text-[10px] font-medium sm:text-xs ${
                              post.published ? "border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" : "border-border bg-surface text-muted-foreground"
                            }`}>
                            {post.published ? "Publicado" : "Rascunho"}
                          </button>
                          <button onClick={() => { setEditingBlog(post.id); setEditBlogImage(null); setEditBlogData({ title: post.title, content: post.content, category: post.category, script_code: post.script_code || "", video_url: post.video_url || "", game_compatible: post.game_compatible || "" }); }}
                            className="flex items-center justify-center gap-1 rounded-lg border border-border bg-surface px-2 py-1.5 text-[10px] font-medium text-muted-foreground hover:border-primary sm:text-xs">
                            <Edit2 className="h-3 w-3" /> Editar
                          </button>
                          <label className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-border bg-surface px-2 py-1.5 text-[10px] font-medium text-muted-foreground hover:border-primary sm:text-xs">
                            <Upload className="h-3 w-3" /> Foto
                            <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadBlogImage(post.id, f); }} />
                          </label>
                          <button onClick={() => deleteBlogPost(post.id)} className="flex items-center justify-center gap-1 rounded-lg border border-destructive/30 px-2 py-1.5 text-[10px] text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-3 w-3" /> Excluir
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {blogPosts.length === 0 && <EmptyState text="Nenhum post publicado ainda." />}
              </div>
              {/* Blog Comments Management */}
              <div className="mt-6">
                <h3 className="flex items-center gap-2 font-heading text-base font-bold sm:text-lg">
                  <MessageSquare className="h-4 w-4 text-primary" /> Comentários dos Posts ({blogComments.length})
                </h3>
                <div className="mt-3 space-y-2">
                  {blogComments.map(c => {
                    const parentPost = blogPosts.find(p => p.id === c.post_id);
                    return (
                      <div key={c.id} className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-background p-3 sm:p-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold">{c.author_name}</p>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < c.rating ? "fill-primary text-primary" : "text-muted-foreground/20"}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Post: {parentPost?.title || c.post_id.slice(0, 8)} • {new Date(c.created_at).toLocaleDateString("pt-BR")}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.comment}</p>
                        </div>
                        <button onClick={() => deleteBlogComment(c.id)} className="flex-shrink-0 rounded-lg border border-destructive/30 px-2 py-1.5 text-[10px] text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                  {blogComments.length === 0 && <EmptyState text="Nenhum comentário nos posts." />}
                </div>
              </div>
            </div>
          )}

          {/* ====== MODERATION ====== */}
          {tab === "moderation" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-lg font-bold sm:text-xl">Usuários ({profiles.length})</h2>
                <div className="mt-3 space-y-2">
                  {profiles.map(u => (
                    <div key={u.id} className="flex items-center justify-between rounded-2xl border border-border bg-background p-3 sm:p-4">
                      <div>
                        <p className="text-sm font-bold">{u.full_name || "Sem nome"}</p>
                        <p className="text-[10px] text-muted-foreground sm:text-xs">ID: {u.user_id?.slice(0, 8)}... • {new Date(u.created_at).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{orders.filter(o => o.user_id === u.user_id).length} pedidos</span>
                    </div>
                  ))}
                  {profiles.length === 0 && <EmptyState text="Nenhum usuário cadastrado." />}
                </div>
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold sm:text-xl">Avaliações ({reviews.length})</h2>
                <div className="mt-3 space-y-2">
                  {reviews.map(r => (
                    <div key={r.id} className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-background p-3 sm:p-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold">{r.author_name}</p>
                          {r.is_fake && <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">Fake</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{r.game_id} • {"⭐".repeat(r.rating)}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.comment}</p>
                      </div>
                      <button onClick={() => deleteReview(r.id)} className="flex-shrink-0 text-xs text-destructive hover:underline">Remover</button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold sm:text-xl">Todos os Pedidos ({orders.length})</h2>
                <div className="mt-3 space-y-2">
                  {orders.slice(0, 20).map(o => (
                    <div key={o.id} className="rounded-2xl border border-border bg-background p-3 sm:p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{o.full_name}</p>
                          <p className="text-xs text-muted-foreground">{o.game_id} • {o.quantity} un • {o.game_username}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(o.created_at).toLocaleString("pt-BR")}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gradient-gold">R$ {Number(o.total_price).toFixed(2)}</span>
                          <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)} className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground">
                            {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ====== EARNINGS ====== */}
          {tab === "earnings" && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="font-heading text-lg font-bold sm:text-xl">Relatório de Ganhos</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
                <StatCard icon={Clock} label="Hoje" value={`R$ ${revenueToday.toFixed(2)}`} />
                <StatCard icon={TrendingUp} label="7 dias" value={`R$ ${revenueWeek.toFixed(2)}`} />
                <StatCard icon={BarChart3} label="30 dias" value={`R$ ${revenueMonth.toFixed(2)}`} />
                <StatCard icon={DollarSign} label="Total Geral" value={`R$ ${totalRevenue.toFixed(2)}`} gradient />
              </div>
              <div className="rounded-2xl border border-border bg-background p-4 sm:p-6">
                <h3 className="font-heading text-sm font-bold sm:text-base">Receita por dia</h3>
                <div className="mt-4 h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(220, 10%, 60%)" }} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(220, 10%, 60%)" }} />
                      <Tooltip contentStyle={{ background: "hsl(220, 20%, 14%)", border: "1px solid hsl(220, 15%, 20%)", borderRadius: 12, fontSize: 12 }} />
                      <Bar dataKey="receita" fill="hsl(45, 100%, 51%)" radius={[6, 6, 0, 0]} name="Receita (R$)" />
                      <Bar dataKey="pedidos" fill="hsl(210, 80%, 55%)" radius={[6, 6, 0, 0]} name="Pedidos" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4 sm:p-6">
                <h3 className="font-heading text-sm font-bold sm:text-base">Receita por Jogo</h3>
                <div className="mt-3 space-y-2">
                  {["roblox", "clash-royale", "brawl-stars"].map(game => {
                    const gameOrders = orders.filter(o => o.game_id === game && o.status !== "cancelado");
                    const gameRevenue = gameOrders.reduce((s, o) => s + Number(o.total_price), 0);
                    return (
                      <div key={game} className="flex items-center justify-between rounded-xl bg-surface p-3">
                        <span className="text-sm font-medium capitalize">{game.replace("-", " ")}</span>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gradient-gold">R$ {gameRevenue.toFixed(2)}</p>
                          <p className="text-[10px] text-muted-foreground">{gameOrders.length} pedidos</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ====== MODERATORS ====== */}
          {tab === "moderators" && (
            <div className="space-y-6">
              <h2 className="font-heading text-lg font-bold sm:text-xl">Gerenciar Moderadores</h2>
              <div className="rounded-2xl border border-border bg-background p-4 sm:p-6">
                <h3 className="text-sm font-bold sm:text-base">Adicionar Moderador</h3>
                <div className="mt-3 space-y-3">
                  <input type="text" value={newModEmail} onChange={e => setNewModEmail(e.target.value)} placeholder="Discord do usuário"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {Object.entries(modPerms).map(([key, val]) => (
                      <label key={key} className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-xs sm:text-sm">
                        <input type="checkbox" checked={val} onChange={() => setModPerms(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))} className="h-4 w-4 rounded border-border accent-primary" />
                        {key.replace("can_", "").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                    ))}
                  </div>
                  <button onClick={addModerator} disabled={addingMod || !newModEmail} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50">
                    {addingMod ? "Adicionando..." : "Adicionar Moderador"}
                  </button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold sm:text-base">Moderadores Atuais ({moderators.length})</h3>
                <div className="mt-3 space-y-2">
                  {moderators.map(m => {
                    const perms = modPermissions.find(p => p.user_id === m.user_id);
                    return (
                      <div key={m.id} className="flex items-center justify-between rounded-2xl border border-border bg-background p-3 sm:p-4">
                        <div>
                          <p className="text-sm font-bold">{getProfileName(m.user_id)}</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {perms && Object.entries(perms).filter(([k, v]) => v === true && k.startsWith("can_")).map(([k]) => (
                              <span key={k} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                                {k.replace("can_", "").replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => removeModerator(m.user_id)} className="text-xs text-destructive hover:underline">Remover</button>
                      </div>
                    );
                  })}
                  {moderators.length === 0 && <EmptyState text="Nenhum moderador adicionado." />}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Sub-components
const StatCard = ({ icon: Icon, label, value, gradient }: { icon: any; label: string; value: string; gradient?: boolean }) => (
  <div className="rounded-2xl border border-border bg-background p-3 sm:p-5">
    <Icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
    <p className={`mt-1.5 text-lg font-bold sm:mt-2 sm:text-2xl ${gradient ? "text-gradient-gold" : ""}`}>{value}</p>
    <p className="text-[10px] text-muted-foreground sm:text-xs">{label}</p>
  </div>
);

const MiniStat = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="rounded-xl border border-border bg-background p-2.5 text-center sm:p-3">
    <p className="text-lg font-bold sm:text-xl" style={{ color }}>{value}</p>
    <p className="text-[10px] text-muted-foreground">{label}</p>
  </div>
);

const QuickLink = ({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) => (
  <button onClick={onClick} className="flex items-center gap-2 rounded-xl border border-border bg-background p-3 text-left text-xs font-medium text-foreground transition-all hover:border-primary/40 sm:p-4 sm:text-sm">
    <Icon className="h-4 w-4 flex-shrink-0 text-primary" />
    {label}
  </button>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="rounded-2xl border border-dashed border-border py-8 text-center text-xs text-muted-foreground sm:py-12 sm:text-sm">
    {text}
  </div>
);

const CreateProductForm = ({ onCreated }: { onCreated: () => void }) => {
  const [name, setName] = useState("");
  const [gameId, setGameId] = useState("roblox");
  const [currency, setCurrency] = useState("Robux");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  const gameOptions = [
    { id: "roblox", currencies: ["Robux", "Gamepass", "Frutas"] },
    { id: "clash-royale", currencies: ["Gemas", "Passe Royale", "Evolução", "Heroicos", "Ouro"] },
    { id: "brawl-stars", currencies: ["Gemas"] },
  ];

  const handleCreate = async () => {
    if (!name.trim() || !price) { toast.error("Preencha nome e preço"); return; }
    setCreating(true);
    try {
      const { data, error } = await supabase.from("products").insert({
        name, game_id: gameId, currency, price_per_unit: parseFloat(price), active: true,
      }).select().single();
      if (error) throw error;

      if (imageFile && data) {
        const ext = imageFile.name.split(".").pop();
        const path = `${data.id}.${ext}`;
        await supabase.storage.from("product-images").upload(path, imageFile, { upsert: true });
        const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
        await supabase.from("products").update({ image_url: publicUrl }).eq("id", data.id);
      }

      toast.success("Produto criado!");
      setName(""); setPrice(""); setImageFile(null);
      onCreated();
    } catch (e: any) { toast.error(e.message); } finally { setCreating(false); }
  };

  return (
    <div className="rounded-2xl border border-border bg-background p-4 sm:p-6">
      <h3 className="flex items-center gap-2 text-sm font-bold sm:text-base"><Plus className="h-4 w-4 text-primary" /> Criar Novo Produto</h3>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do produto"
          className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
        <select value={gameId} onChange={e => {
          setGameId(e.target.value);
          setCurrency(gameOptions.find(g => g.id === e.target.value)?.currencies[0] || "");
        }} className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
          {gameOptions.map(g => <option key={g.id} value={g.id}>{g.id.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}
        </select>
        <select value={currency} onChange={e => setCurrency(e.target.value)}
          className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
          {gameOptions.find(g => g.id === gameId)?.currencies.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="Preço por unidade (R$)"
          className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-medium text-muted-foreground hover:border-primary sm:text-sm">
          <Upload className="h-4 w-4" /> {imageFile ? imageFile.name : "Imagem do produto"}
          <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files?.[0] || null)} />
        </label>
        <button onClick={handleCreate} disabled={creating}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50">
          {creating ? "Criando..." : "Criar Produto"}
        </button>
      </div>
    </div>
  );
};

export default Admin;
