"use client"
import Header from '../Header/Header'
import Footer from '../Footer/Footer'
import Body from '../Body/Body'
import { Flex } from '@chakra-ui/react'

const Layout = () => {
  return (
    <Flex
      direction="column"
      h="100vh"
      justifyContent="center"
    >
        <Header />
        <Flex
          grow="1"
          p="2rem"
        >
          <Body />
        </Flex>
        <Footer />
    </Flex>
  )
}

export default Layout