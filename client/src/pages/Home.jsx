import React, { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Testimonial from '../components/Testimonial'
import Plan from '../components/Plan'
import Footer from '../components/Footer'
import AiTools from '../components/AiTools'
import { useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const { isSignedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isSignedIn) {
      navigate('/ai')
    }
  }, [isSignedIn, navigate])

  return (
    <>
        <Navbar />
        <Hero />
        <AiTools />
        <Testimonial />
        <Plan />
        <Footer />
    </>
  )
}

export default Home