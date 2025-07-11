
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { User, Settings, Home, Plus, LogOut } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { enUS } from 'date-fns/locale';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ThemeToggle } from "@/components/ThemeToggle";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { FileVideo, ImagePlus, MessageSquare, Calendar as CalendarIcon } from "lucide-react"
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
            
            if (!user) {
                navigate('/admin/auth');
            }
        };
        
        getUser();
    }, [navigate]);

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            navigate('/admin/auth');
        } catch (error) {
            console.error("Failed to sign out", error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>Redirecting to login...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <header className="bg-white dark:bg-gray-800 shadow">
                <div className="container mx-auto py-4 px-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Home className="h-6 w-6" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
                        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <NotificationCenter />
                        <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleSignOut}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                {/* User Profile Card */}
                <Card className="bg-white dark:bg-gray-700 shadow-md rounded-md">
                    <CardHeader>
                        <CardTitle>User Profile</CardTitle>
                        <CardDescription>Manage your account settings and set preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center p-6">
                        <Avatar className="h-20 w-20 rounded-full border-2 border-blue-500 dark:border-blue-400">
                            <AvatarImage src="https://github.com/shadcn.png" alt="Admin Avatar" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className="mt-4 text-center">
                            <p className="text-lg font-semibold">{user.email}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Administrator</p>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-between">
                        <Button onClick={() => navigate('/admin/users')}>
                            <User className="h-4 w-4 mr-2" />
                            Manage Users
                        </Button>
                    </CardFooter>
                </Card>

                {/* Quick Actions Card */}
                <Card className="bg-white dark:bg-gray-700 shadow-md rounded-md">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Perform common tasks quickly.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 gap-4">
                            <Button onClick={() => navigate('/admin/orphanages')} className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Orphanage
                            </Button>
                            <Button onClick={() => navigate('/admin/partners')} className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Partner
                            </Button>
                            <Button onClick={() => navigate('/admin/children')} className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Children
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Calendar Card */}
                <Card className="bg-white dark:bg-gray-700 shadow-md rounded-md">
                    <CardHeader>
                        <CardTitle>Calendar</CardTitle>
                        <CardDescription>View events and schedule tasks.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 p-6">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[240px] justify-start text-left font-normal",
                                        !selectedDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? format(selectedDate, "PPP", { locale: enUS }) : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="center" side="bottom">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    disabled={(date) =>
                                        date > new Date()
                                    }
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </CardContent>
                </Card>
            </div>

            {/* Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-50 overflow-auto bg-black/50 dark:bg-black/75 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-semibold mb-6">Settings</h2>
                        <div className="flex items-center justify-between mb-4">
                            <Label htmlFor="theme-toggle">Dark Mode</Label>
                            <ThemeToggle />
                        </div>
                        <Button variant="secondary" onClick={() => setIsSettingsOpen(false)}>Close</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
