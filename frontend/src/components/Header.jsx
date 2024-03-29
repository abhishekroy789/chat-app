import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { ChevronDownIcon, Search2Icon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { ProfileModal, SkeletonAnim, UserList } from "./index";
import axios from "axios";
import { ChatState } from "../context/ChatProvider";

const Header = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const toast = useToast();
  const { user, chats, setChats, setSelectedChat } = ChatState();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter Something In Search",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });

      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.get(
        `http://localhost:5000/user/search?search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load The Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const accessChat = async (userId) => {
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `http://localhost:5000/chat/access`,
        { userId },
        config
      );

      setSelectedChat(data);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        h="8%"
      >
        <Button
          bg="blue.600"
          _hover={{ bg: "blue.700" }}
          color="white"
          onClick={onOpen}
        >
          <Search2Icon />
          <Text display={{ base: "none", md: "flex" }} p={4}>
            Search Users
          </Text>
        </Button>
        <Text
          fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
          color="blue.600"
          fontWeight="medium"
        >
          Chatify
        </Text>
        <Menu>
          <MenuButton bg="white" as={Button} rightIcon={<ChevronDownIcon />}>
            <Avatar
              size="sm"
              cursor="pointer"
              name={user.name}
              src={user.photo}
            />
          </MenuButton>
          <MenuList>
            <ProfileModal user={user}>
              <MenuItem>My Profile</MenuItem>{" "}
            </ProfileModal>
            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
          </MenuList>
        </Menu>
      </Box>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Search Users To Chat</DrawerHeader>

          <DrawerBody>
            <Input
              placeholder="Type here..."
              mb={3}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {loading ? (
              <SkeletonAnim />
            ) : (
              searchResult.map((user) => {
                return (
                  <UserList
                    key={user._id}
                    user={user}
                    handleFunc={() => accessChat(user._id)}
                  />
                );
              })
            )}
          </DrawerBody>

          <DrawerFooter>
            <Button
              color="white"
              bg="blue.600"
              _hover={{ bg: "blue.700" }}
              onClick={handleSearch}
            >
              Search
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Header;
