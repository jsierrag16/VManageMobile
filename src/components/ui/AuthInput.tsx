import { Ionicons } from "@expo/vector-icons";
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type IconName = keyof typeof Ionicons.glyphMap;

type AuthInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  leftIconName: IconName;
  rightIconName?: IconName;
  onRightPress?: () => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  error?: string;
};

export default function AuthInput({
  label,
  placeholder,
  value,
  onChangeText,
  leftIconName,
  rightIconName,
  onRightPress,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "sentences",
  error,
}: AuthInputProps) {
  const hasError = !!error;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.inputContainer, hasError && styles.inputContainerError]}>
        <Ionicons
          name={leftIconName}
          size={20}
          color={hasError ? "#FF4D4F" : "#8A94A6"}
          style={styles.leftIcon}
        />

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#8A94A6"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />

        {rightIconName ? (
          <Pressable onPress={onRightPress} hitSlop={10}>
            <Ionicons
              name={rightIconName}
              size={20}
              color="#8A94A6"
              style={styles.rightIcon}
            />
          </Pressable>
        ) : null}
      </View>

      {hasError ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 10,
  },
  label: {
    color: "#1F2937",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  inputContainer: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  inputContainerError: {
    borderColor: "#FF4D4F",
  },
  leftIcon: {
    marginRight: 10,
  },
  rightIcon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    color: "#111827",
    fontSize: 16,
    paddingVertical: 14,
  },
  errorText: {
    marginTop: 8,
    color: "#FF4D4F",
    fontSize: 13,
    lineHeight: 18,
  },
});