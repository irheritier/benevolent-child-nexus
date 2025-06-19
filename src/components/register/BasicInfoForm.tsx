
import { UseFormReturn } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormData {
  centerName: string;
  capacity: string;
  provinceId: string;
  cityId: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  description: string;
}

interface BasicInfoFormProps {
  form: UseFormReturn<FormData>;
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
