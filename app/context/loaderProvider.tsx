'use client'
import React, { createContext, ReactNode, useCallback, useState } from 'react'
import { set } from 'zod';

interface loaderContextInterface {
    isLoading:boolean;
    toggleLoading: () => void;
}

export const LoaderContext = createContext<loaderContextInterface|undefined>(undefined);
const LoaderProvider = ({children}:{children:ReactNode}) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const toggleLoading = useCallback(() => {
        setIsLoading(true);
           setTimeout(()=>{
               setIsLoading(false);
           },1000)
      },[]);
  return (
     <LoaderContext.Provider value={{isLoading,toggleLoading}}>
        {children}
     </LoaderContext.Provider>
  )
}

export default LoaderProvider
