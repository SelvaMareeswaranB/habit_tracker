import { useAuth } from "@/lib/auth-context";
import { View,Text } from "react-native";
import { Button } from "react-native-paper";

export default function LogInScreen(){
    const{signOut}=useAuth()
    return(
        <View>
            <Text>This is Login View</Text>
            <Button mode="text" onPress={signOut} icon={"logout"}>Sign Out</Button>
        </View>
    )
}