import userModel from "../models/user.model.js";
import productModel from "../models/product.model.js";
import orderModel from "../models/order.model.js";
import sessionModel from "../models/sessions.model.js";

export const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalVendors, totalProducts, totalOrders, orders] = await Promise.all([
            userModel.countDocuments({ accountType: "user" }),
            userModel.countDocuments({ accountType: "vendor" }),
            productModel.countDocuments(),
            orderModel.countDocuments(),
            orderModel.find()
        ]);

        let totalRevenue = 0;
        const ordersByStatus = { Pending: 0, Processing: 0, Shipped: 0, "Out for Delivery": 0, Delivered: 0, Cancelled: 0 };

        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.status !== "Cancelled") {
                    totalRevenue += item.price * item.quantity;
                }
                ordersByStatus[item.status] = (ordersByStatus[item.status] || 0) + 1;
            });
        });

        const recentOrders = await orderModel.find()
            .populate("user", "username email")
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            totalUsers,
            totalVendors,
            totalProducts,
            totalOrders,
            totalRevenue,
            ordersByStatus,
            recentOrders
        });
    } catch (err) {
        console.error("Dashboard stats error:", err.message);
        res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const { search, role, page = 1, limit = 10 } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }
        if (role) {
            query.accountType = role;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [users, total] = await Promise.all([
            userModel.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
            userModel.countDocuments(query)
        ]);

        res.status(200).json({
            users,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (err) {
        console.error("Get all users error:", err.message);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    } catch (err) {
        console.error("Get user by id error:", err.message);
        res.status(500).json({ message: "Failed to fetch user" });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!["user", "vendor"].includes(role)) {
            return res.status(400).json({ message: "Invalid role. Must be user or vendor" });
        }

        const user = await userModel.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.accountType === "admin") {
            return res.status(400).json({ message: "Cannot change admin role" });
        }

        user.accountType = role;
        await user.save();

        res.status(200).json({ message: "Role updated successfully", user: { _id: user._id, username: user.username, email: user.email, accountType: user.accountType } });
    } catch (err) {
        console.error("Update user role error:", err.message);
        res.status(500).json({ message: "Failed to update role" });
    }
};

export const banUser = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.accountType === "admin") {
            return res.status(400).json({ message: "Cannot ban admin" });
        }

        user.isBanned = true;
        await user.save();

        await sessionModel.updateMany({ user: user._id }, { revoke: true });

        res.status(200).json({ message: "User banned successfully" });
    } catch (err) {
        console.error("Ban user error:", err.message);
        res.status(500).json({ message: "Failed to ban user" });
    }
};

export const unbanUser = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isBanned = false;
        await user.save();

        res.status(200).json({ message: "User unbanned successfully" });
    } catch (err) {
        console.error("Unban user error:", err.message);
        res.status(500).json({ message: "Failed to unban user" });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const { search, category, page = 1, limit = 10 } = req.query;
        const query = {};

        if (search) {
            query.name = { $regex: search, $options: "i" };
        }
        if (category) {
            query.category = category;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [products, total] = await Promise.all([
            productModel.find(query).populate("vendor", "username email").sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
            productModel.countDocuments(query)
        ]);

        res.status(200).json({
            products,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (err) {
        console.error("Get all products error:", err.message);
        res.status(500).json({ message: "Failed to fetch products" });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        await productModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
        console.error("Delete product error:", err.message);
        res.status(500).json({ message: "Failed to delete product" });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 10 } = req.query;
        const query = {};

        if (status) {
            query["items.status"] = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        let ordersQuery = orderModel.find(query)
            .populate("user", "username email")
            .populate("items.product", "name images")
            .sort({ createdAt: -1 });

        const [orders, total] = await Promise.all([
            ordersQuery.skip(skip).limit(parseInt(limit)),
            orderModel.countDocuments(query)
        ]);

        if (search) {
            const searchLower = search.toLowerCase();
            const filteredOrders = orders.filter(order => {
                const orderIdMatch = order._id.toString().includes(searchLower);
                const userMatch = order.user?.username?.toLowerCase().includes(searchLower) ||
                    order.user?.email?.toLowerCase().includes(searchLower);
                return orderIdMatch || userMatch;
            });

            return res.status(200).json({
                orders: filteredOrders,
                total: filteredOrders.length,
                page: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit))
            });
        }

        res.status(200).json({
            orders,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (err) {
        console.error("Get all orders error:", err.message);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await orderModel.findById(req.params.id)
            .populate("user", "username email address")
            .populate("items.product", "name images price")
            .populate("items.vendor", "username email");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ order });
    } catch (err) {
        console.error("Get order by id error:", err.message);
        res.status(500).json({ message: "Failed to fetch order" });
    }
};

export const getAllVendors = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        const query = { accountType: "vendor" };

        if (search) {
            query.$or = [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [vendors, total] = await Promise.all([
            userModel.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
            userModel.countDocuments(query)
        ]);

        const vendorsWithStats = await Promise.all(
            vendors.map(async (vendor) => {
                const [productCount, orders] = await Promise.all([
                    productModel.countDocuments({ vendor: vendor._id }),
                    orderModel.find({ "items.vendor": vendor._id })
                ]);

                let totalRevenue = 0;
                let totalOrders = orders.length;
                orders.forEach(order => {
                    order.items.forEach(item => {
                        if (item.vendor.toString() === vendor._id.toString() && item.status !== "Cancelled") {
                            totalRevenue += item.price * item.quantity;
                        }
                    });
                });

                return {
                    ...vendor.toObject(),
                    productCount,
                    totalOrders,
                    totalRevenue
                };
            })
        );

        res.status(200).json({
            vendors: vendorsWithStats,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (err) {
        console.error("Get all vendors error:", err.message);
        res.status(500).json({ message: "Failed to fetch vendors" });
    }
};

export const getAnalytics = async (req, res) => {
    try {
        const { period = "30d" } = req.query;

        let dateFilter;
        const now = new Date();
        if (period === "7d") {
            dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (period === "90d") {
            dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        } else {
            dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const [
            orders,
            allOrders,
            products,
            users,
            vendors
        ] = await Promise.all([
            orderModel.find({ createdAt: { $gte: dateFilter } }),
            orderModel.find(),
            productModel.find().populate("vendor", "username"),
            userModel.find().select("createdAt accountType"),
            userModel.find({ accountType: "vendor" }).select("username")
        ]);

        const revenueByDay = {};
        const ordersByDay = {};
        const categoryCount = {};
        const paymentMethods = { COD: 0, UPI: 0, Card: 0 };
        const topProducts = {};
        const vendorRevenue = {};

        let totalRevenue = 0;
        let totalItemsSold = 0;

        orders.forEach(order => {
            if (!order.createdAt) return;
            const day = order.createdAt.toISOString().split("T")[0];
            revenueByDay[day] = revenueByDay[day] || 0;
            ordersByDay[day] = ordersByDay[day] || 0;
            ordersByDay[day]++;

            if (order.paymentMethod) {
                paymentMethods[order.paymentMethod] = (paymentMethods[order.paymentMethod] || 0) + 1;
            }

            order.items.forEach(item => {
                if (item.status !== "Cancelled") {
                    const amount = item.price * item.quantity;
                    revenueByDay[day] += amount;
                    totalRevenue += amount;
                    totalItemsSold += item.quantity;
                }
            });
        });

        const productAgg = {};
        allOrders.forEach(order => {
            order.items.forEach(item => {
                if (item.status !== "Cancelled") {
                    const pid = item.product?.toString() || "unknown";
                    if (!productAgg[pid]) productAgg[pid] = { name: item.product?.name || "Product", count: 0, revenue: 0 };
                    productAgg[pid].count += item.quantity;
                    productAgg[pid].revenue += item.price * item.quantity;
                }
            });
        });

        const topProductsList = Object.values(productAgg)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 8);

        products.forEach(p => {
            const cat = p.category || "Uncategorized";
            categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });

        allOrders.forEach(order => {
            order.items.forEach(item => {
                if (item.status !== "Cancelled") {
                    const vendorId = item.vendor?.toString() || "unknown";
                    const vendorName = products.find(p => p.vendor?._id?.toString() === vendorId)?.vendor?.username || "Vendor";
                    vendorRevenue[vendorId] = vendorRevenue[vendorId] || { name: vendorName, revenue: 0 };
                    vendorRevenue[vendorId].revenue += item.price * item.quantity;
                }
            });
        });

        const topVendorsList = Object.values(vendorRevenue)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 8);

        const sortedDays = Object.keys(revenueByDay).sort();
        const revenueChart = sortedDays.map(day => ({ date: day, revenue: revenueByDay[day] }));
        const ordersChart = sortedDays.map(day => ({ date: day, orders: ordersByDay[day] }));

        const userGrowth = {};
        users.forEach(u => {
            if (!u.createdAt) return;
            const day = u.createdAt.toISOString().split("T")[0];
            if (!userGrowth[day]) userGrowth[day] = { users: 0, vendors: 0 };
            if (u.accountType === "vendor") userGrowth[day].vendors++;
            else userGrowth[day].users++;
        });
        const growthChart = Object.keys(userGrowth).sort().map(day => ({
            date: day,
            users: userGrowth[day].users,
            vendors: userGrowth[day].vendors
        }));

        const successOrders = allOrders.filter(o => o.items.some(i => i.status === "Delivered")).length;
        const cancelledOrders = allOrders.filter(o => o.items.every(i => i.status === "Cancelled")).length;
        const completionRate = allOrders.length > 0 ? ((successOrders / allOrders.length) * 100).toFixed(1) : 0;

        let allTimeRevenue = 0;
        allOrders.forEach(order => {
            order.items.forEach(item => {
                if (item.status !== "Cancelled") {
                    allTimeRevenue += item.price * item.quantity;
                }
            });
        });
        const avgOrderValue = allOrders.length > 0 ? (allTimeRevenue / allOrders.length).toFixed(0) : 0;

        res.status(200).json({
            summary: {
                totalRevenue,
                totalOrders: allOrders.length,
                totalProducts: products.length,
                totalUsers: users.filter(u => u.accountType === "user").length,
                totalVendors: vendors.length,
                totalItemsSold,
                completionRate: parseFloat(completionRate),
                avgOrderValue: parseInt(avgOrderValue),
                cancelledOrders
            },
            revenueChart,
            ordersChart,
            categoryDistribution: Object.entries(categoryCount).map(([name, count]) => ({ name, count })),
            paymentMethods: Object.entries(paymentMethods).map(([name, count]) => ({ name, count })),
            topProducts: topProductsList,
            topVendors: topVendorsList,
            userGrowthChart: growthChart
        });
    } catch (err) {
        console.error("Get analytics error:", err.message);
        res.status(500).json({ message: "Failed to fetch analytics" });
    }
};
