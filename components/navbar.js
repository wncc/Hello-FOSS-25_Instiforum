import React from 'react'

const Navbar = () => {
  return (
    <>
    <div className=' sticky top-0 flex justify-between items-center p-4 bg-amber-100 text-white'>
        <h1 className='text-3xl font-bold text-black'>Instiforum</h1>
        <div >
            <button className='bg-blue-500 flex w-40 justify-around items-center text-white px-4 py-2 rounded-full mr-2'> <img src='placeholder.png' className='rounded-full h-10 w-10'></img>Profile</button>
        </div>
      
    </div>
    </>
  )
}

export default Navbar
