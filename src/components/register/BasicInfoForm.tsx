
import { UseFormReturn } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrphanageFormData, schoolingRateOptions, annualDiseaseRateOptions, mealsPerDayOptions } from "@/types/orphanage";
import { useEffect } from "react";

interface BasicInfoFormProps {
  form: UseFormReturn<OrphanageFormData>;
  texts: any;
  provinces: any[];
  cities: any[];
  selectedProvinceId: string;
  onProvinceChange: (provinceId: string) => void;
}

export const BasicInfoForm = ({ 
  form, 
  texts, 
  provinces, 
  cities, 
  selectedProvinceId, 
  onProvinceChange 
}: BasicInfoFormProps) => {
  const childrenTotal = form.watch("children_total");
  const boysCount = form.watch("boys_count");

  // Calculate girls_count automatically
  useEffect(() => {
    const total = parseInt(childrenTotal) || 0;
    const boys = parseInt(boysCount) || 0;
    const girls = Math.max(0, total - boys);
    form.setValue("girls_count", girls.toString());
  }, [childrenTotal, boysCount, form]);

  return (
    <Form {...form}>
      <div className="space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <FormField
            control={form.control}
            name="centerName"
            rules={{ required: texts.validation.required }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-sm sm:text-base">
                  {texts.form.centerName} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={texts.form.centerNamePlaceholder}
                    className="h-10 sm:h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-sm sm:text-base">{texts.form.capacity}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={texts.form.capacityPlaceholder}
                    className="h-10 sm:h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <FormField
            control={form.control}
            name="provinceId"
            rules={{ required: texts.validation.selectProvince }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-sm sm:text-base">
                  {texts.form.province} <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={onProvinceChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-10 sm:h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base">
                      <SelectValue placeholder="Sélectionnez une province" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province.id} value={province.id}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cityId"
            rules={{ required: texts.validation.selectLocality }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-sm sm:text-base">
                  {texts.form.locality} <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedProvinceId}>
                  <FormControl>
                    <SelectTrigger className="h-10 sm:h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base">
                      <SelectValue placeholder="Sélectionnez une localité" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-sm sm:text-base">{texts.form.address}</FormLabel>
              <FormControl>
                <Input
                  placeholder={texts.form.addressPlaceholder}
                  className="h-10 sm:h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nouvelle section pour les informations sur les enfants */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Informations sur les enfants accueillis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <FormField
              control={form.control}
              name="children_total"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-sm sm:text-base">
                    Nombre total d'enfants
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      className="h-10 sm:h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="boys_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-sm sm:text-base">
                    Nombre de garçons
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      className="h-10 sm:h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="girls_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-sm sm:text-base">
                    Nombre de filles (calculé)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      readOnly
                      className="h-10 sm:h-12 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-sm sm:text-base cursor-not-allowed"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section pour les taux et repas */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Informations complémentaires</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <FormField
              control={form.control}
              name="schooling_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-sm sm:text-base">
                    Taux de scolarisation
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 sm:h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base">
                        <SelectValue placeholder="Sélectionnez un taux" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {schoolingRateOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="annual_disease_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-sm sm:text-base">
                    Taux annuel de maladies
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 sm:h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base">
                        <SelectValue placeholder="Sélectionnez un taux" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {annualDiseaseRateOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meals_per_day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-sm sm:text-base">
                    Repas par jour
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 sm:h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base">
                        <SelectValue placeholder="Sélectionnez le nombre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mealsPerDayOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <FormField
            control={form.control}
            name="contactPerson"
            rules={{ required: texts.validation.required }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-sm sm:text-base">
                  {texts.form.contactPerson} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={texts.form.contactPersonPlaceholder}
                    className="h-10 sm:h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            rules={{ required: texts.validation.required }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-sm sm:text-base">
                  {texts.form.phone} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={texts.form.phonePlaceholder}
                    className="h-10 sm:h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          rules={{ 
            required: texts.validation.required,
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: texts.validation.email
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-sm sm:text-base">
                {texts.form.email} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={texts.form.emailPlaceholder}
                  className="h-10 sm:h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-sm sm:text-base">{texts.form.description}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={texts.form.descriptionPlaceholder}
                  className="min-h-[120px] sm:min-h-[140px] resize-none border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
};
