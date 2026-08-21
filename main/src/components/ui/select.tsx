import React from "react"

export interface SelectProps {
  onValueChange: (value: string) => void
  placeholder?: string
  children: React.ReactNode
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>((props, ref) => {
  const { onValueChange, placeholder, children } = props
  const [value, setValue] = React.useState<string>("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.value
    setValue(selected)
    onValueChange(selected)
  }

  return (
    <div ref={ref} className="relative">
      <div className="absolute left-0 top-0 bottom-0 pl-10">
        {children}
      </div>
      <input
        onChange={handleChange}
        className="block w-full rounded-md border p-2 pl-10 placeholder-gray-500"
        placeholder={placeholder}
        defaultValue={value}
      />
    </div>
  )
})

Select.displayName = "Select"