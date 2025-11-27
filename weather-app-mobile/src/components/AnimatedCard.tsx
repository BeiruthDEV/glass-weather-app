import React, { useEffect } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing
} from 'react-native-reanimated';
import { ViewStyle } from 'react-native';

interface AnimatedCardProps {
    children: React.ReactNode;
    index?: number; // Para criar o efeito "cascata" (um depois do outro)
    style?: ViewStyle;
}

export const AnimatedCard = ({ children, index = 0, style }: AnimatedCardProps) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(50); // Começa 50px para baixo

    useEffect(() => {
        // Inicia a animação
        // index * 100 cria o delay para cada item aparecer depois do anterior
        const delay = index * 200;

        opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
        translateY.value = withDelay(
            delay,
            withTiming(0, {
                duration: 500,
                easing: Easing.out(Easing.cubic) // Efeito de desaceleração suave
            })
        );
    }, [index]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ translateY: translateY.value }],
        };
    });

    return (
        <Animated.View style={[style, animatedStyle]}>
            {children}
        </Animated.View>
    );
};