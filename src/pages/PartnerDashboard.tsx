
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

const PartnerDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const pieChartData = [
    { name: 'Orphelins', value: 400 },
    { name: 'Enfants Vulnérables', value: 300 },
    { name: 'Enfants Abandonnés', value: 300 },
    { name: 'Autres', value: 200 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const barChartData = [
    { name: 'Jan', uv: 4000, pv: 2400, amt: 2400 },
    { name: 'Feb', uv: 3000, pv: 1398, amt: 2210 },
    { name: 'Mar', uv: 2000, pv: 9800, amt: 2290 },
    { name: 'Apr', uv: 2780, pv: 3908, amt: 2000 },
    { name: 'May', uv: 1890, pv: 4800, amt: 2181 },
    { name: 'Jun', uv: 2390, pv: 3800, amt: 2500 },
    { name: 'Jul', uv: 3490, pv: 4300, amt: 2100 },
  ];

  // Animation variants with proper TypeScript types
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut" as const,
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4, 
        ease: "easeOut" as const
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.4, 
        ease: "easeOut" as const
      }
    }
  };

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5, 
        ease: "easeOut" as const
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
      <motion.div
        className="container mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.header className="mb-8" variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Tableau de Bord Partenaire</h1>
              <p className="text-gray-500 dark:text-gray-400">Bienvenue sur votre espace partenaire.</p>
            </div>
            <div className="space-x-4 flex items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) =>
                      date > new Date() || date < new Date("2020-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <NotificationCenter />
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </motion.header>

        <motion.section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" variants={itemVariants}>
          <motion.div variants={cardVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Total des Enfants Pris en Charge</CardTitle>
                <CardDescription>Nombre total d'enfants sous votre responsabilité.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-5 w-20" />
                ) : (
                  <div className="text-3xl font-bold">1,457</div>
                )}
                <Progress value={75} className="mt-4"/>
                <div className="flex justify-between text-muted-foreground mt-2">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Nouveaux Enfants ce Mois-ci</CardTitle>
                <CardDescription>Nombre d'enfants ajoutés ce mois-ci.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-5 w-20" />
                ) : (
                  <div className="text-3xl font-bold">125</div>
                )}
                <Progress value={25} className="mt-4"/>
                <div className="flex justify-between text-muted-foreground mt-2">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Dons Reçus</CardTitle>
                <CardDescription>Montant total des dons reçus ce mois-ci.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-5 w-20" />
                ) : (
                  <div className="text-3xl font-bold">$5,250</div>
                )}
                <Progress value={50} className="mt-4"/>
                <div className="flex justify-between text-muted-foreground mt-2">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.section>

        <motion.section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" variants={itemVariants}>
          <motion.div variants={chartVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Répartition des Enfants</CardTitle>
                <CardDescription>Par type de vulnérabilité.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px]" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={chartVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Tendances des Dons Mensuels</CardTitle>
                <CardDescription>Évolution des dons au cours des derniers mois.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px]" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="pv" fill="#8884d8" />
                      <Bar dataKey="uv" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.section>

        <motion.section className="mb-8" variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Dernières Activités</CardTitle>
              <CardDescription>Suivi des activités récentes.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[200px]" />
              ) : (
                <Table>
                  <TableCaption>Quelques activités récentes dans votre réseau.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Date</TableHead>
                      <TableHead>Activité</TableHead>
                      <TableHead>Utilisateur</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">12/05/2024</TableCell>
                      <TableCell>Enfant ajouté au système</TableCell>
                      <TableCell>Admin</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">11/05/2024</TableCell>
                      <TableCell>Don de $100 reçu</TableCell>
                      <TableCell>Utilisateur</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Support et Contact</CardTitle>
              <CardDescription>Contactez-nous pour toute question ou assistance.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom</Label>
                    <Input type="text" id="name" defaultValue="Votre Nom" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input type="email" id="email" defaultValue="votre@email.com" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">Sujet</Label>
                  <Input type="text" id="subject" defaultValue="Sujet de votre demande" />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" rows={4} defaultValue="Votre message ici..." />
                </div>
                <Button>Envoyer le Message</Button>
              </form>
            </CardContent>
          </Card>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default PartnerDashboard;
