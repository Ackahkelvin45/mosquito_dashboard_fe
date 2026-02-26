import React from 'react'
import Image from 'next/image'
import logo from '../../public/images/logo.png'
import name from '../../public/images/name.png'
import loginiage from '../../public/images/loginimage.png'
import { Eye } from 'lucide-react'
import Link from 'next/link'


function page() { 
  return (
    <div className='w-full h-screen flex flex-row'>
        <div className='w-1/2 h-full flex justify-center bg-[#F5F5F5] items-center'>

        <div className='w-full    max-w-md  flex flex-col '> 

            <div className='flex flex-row justify-center gap-2 items-center'>

           
            <div>
                <Image src={logo} alt='logo' width={50} height={50} />
            </div>
            <div className='flex justify-center items-center'>
                <Image src={name} alt='name' width={200} height={200} />
            </div>
           
            </div>

            <div className='w-full font-raleway text-lg my-5 font-medium text-text-dark text-center '>
            Real-Time Mosquito & Environmental Surveillance
            </div>


            <div className='flex flex-col gap-4 font-raleway mt-4'>

                <div>
                    <label htmlFor='email' className='text-dark text-sm mb-2 font-medium'>Email</label>
                    <input type='email' id='email' placeholder='Enter your email' className='w-full py-2.5 px-3 border border-gray focus:ring-0 placeholder:text-sm text-sm  focus:border-primary focus:outline-none rounded-md' />
                </div>


                <div>
                    <label htmlFor='email' className='text-dark text-sm mb-2 font-medium'>Password</label>

                    <div className='relative'>
                    <input type='email' id='email' placeholder='***************' className='w-full py-2.5 px-3 border border-gray focus:ring-0 placeholder:text-sm text-sm  focus:border-primary focus:outline-none rounded-md' />
                    <Eye  strokeWidth={1.5} size={18} className='absolute  right-3 top-1/2 -translate-y-1/2 text-gray-500' />
                    </div>
                </div>
            </div>

            <div className='mt-12 w-full'>
                <button className='w-full py-2.5 px-3 bg-linear-to-r font-semibold  from-secondary to-primary text-white text-sm  rounded-md'>Login</button>
            </div>

            <div className='mt-2 w-full  font-raleway flex  justify-end'>
                <Link href='/forgot-password' className='text-secondary hover:underline  text-sm font-medium'>Forgot Password?</Link>

            </div>

        </div>

        </div>

        <div className='w-1/2 h-full'>
        <Image src={loginiage} alt='login image'  className='w-full h-full object-cover' />
        </div>
      
    </div>
  )
}

export default page
