import React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return (
    <input
      ref={ref}
      className="block w-full rounded-md border p-2 placeholder-gray-500"
      placeholder={props.placeholder}
      {...props}
    />
  )
})

Input.displayName = "Input"