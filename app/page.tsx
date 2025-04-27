"use client";

import Image from "next/image";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";

import { FaKey, FaMapMarkerAlt, FaHome, FaUsers } from "react-icons/fa";
import { LoaderContext } from "./context/loaderProvider";



export default function Home() {
      const router = useRouter();
      const {toggleLoading} = useContext(LoaderContext)!;

      useEffect(()=>{
           const token = localStorage.getItem('token');
           if(!token){
            router.push('/authentication/login');
           }
           toggleLoading();
      },[]);
  return (
  <div></div>

  );

}