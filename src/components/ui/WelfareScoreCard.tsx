import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Info } from 'lucide-react-native';
import { usePalette } from '@/hooks/useThemedStyles';
import { SkeletonLoader } from './SkeletonLoader';

const SIZE = 140;
const CENTER = SIZE / 2;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ringColor(palette: any, score: number): string {
  if (score >= 70) return palette.success;
  if (score >= 40) return palette.primary;
  return palette.error;
}

function formatINR(amount: number): string {
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `\u20B9${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)}L`;
  }
  if (amount >= 1000) return `\u20B9${(amount / 1000).toFixed(0)}K`;
  return `\u20B9${amount}`;
}

function ScoreRing({ score, palette }: { score: number; palette: any }) {
  const dashOffset = CIRCUMFERENCE * (1 - score / 100);
  const color = ringColor(palette, score);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SIZE} height={SIZE}>
        <Circle cx={CENTER} cy={CENTER} r={RADIUS} stroke={palette.border} strokeWidth={STROKE} fill="none" />
        <G rotation="-90" origin={`${CENTER}, ${CENTER}`}>
          <Circle
            cx={CENTER} cy={CENTER} r={RADIUS}
            stroke={color} strokeWidth={STROKE} fill="none"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: palette.textPrimary, fontSize: 28, fontWeight: '800', lineHeight: 32 }}>
          {score}%
        </Text>
        <Text style={{ color: palette.textMuted, fontSize: 11, marginTop: 2 }}>Welfare Score</Text>
      </View>
    </View>
  );
}

interface WelfareScoreCardProps {
  score: number;
  currentBenefits: number;
  potentialBenefits: number;
}

export function WelfareScoreCard({ score, currentBenefits, potentialBenefits }: WelfareScoreCardProps) {
  const palette = usePalette();

  return (
    <View style={{
      borderRadius: 24, backgroundColor: palette.surface,
      borderWidth: 1, borderColor: palette.border, overflow: 'hidden',
    }}>
      <View style={{
        paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
        borderBottomWidth: 1, borderBottomColor: palette.border,
      }}>
        <Text style={{
          color: palette.textSecondary, fontSize: 11, fontWeight: '600',
          letterSpacing: 1.5, textTransform: 'uppercase',
        }}>
          Your Benefits Overview
        </Text>
      </View>

      <View style={{ padding: 20 }}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <ScoreRing score={score} palette={palette} />
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{
            flex: 1, backgroundColor: palette.background,
            borderRadius: 16, padding: 16, borderWidth: 1, borderColor: palette.border,
          }}>
            <Text style={{
              color: palette.textMuted, fontSize: 10, fontWeight: '600',
              letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6,
            }}>
              Current Benefits
            </Text>
            <Text style={{ color: palette.textPrimary, fontSize: 20, fontWeight: '700' }}>
              {formatINR(currentBenefits)}
            </Text>
            <Text style={{ color: palette.textSecondary, fontSize: 11, marginTop: 2 }}>
              {'\u20B9'}{currentBenefits.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={{
            flex: 1, backgroundColor: palette.background,
            borderRadius: 16, padding: 16, borderWidth: 1, borderColor: palette.primaryA44,
          }}>
            <Text style={{
              color: palette.textMuted, fontSize: 10, fontWeight: '600',
              letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6,
            }}>
              Potential Benefits
            </Text>
            <Text style={{ color: palette.secondary, fontSize: 20, fontWeight: '700' }}>
              {formatINR(potentialBenefits)}
            </Text>
            <Text style={{ color: palette.textSecondary, fontSize: 11, marginTop: 2 }}>
              {'\u20B9'}{potentialBenefits.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {potentialBenefits > currentBenefits && (
          <View style={{
            marginTop: 12, borderRadius: 14,
            backgroundColor: palette.primaryA14, borderWidth: 1, borderColor: palette.primaryA33,
            padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10,
          }}>
            <Info size={18} color={palette.primary} strokeWidth={2} />
            <Text style={{ color: palette.textSecondary, fontSize: 12, flex: 1, lineHeight: 18 }}>
              You could unlock{' '}
              <Text style={{ color: palette.primary, fontWeight: '700' }}>
                {formatINR(potentialBenefits - currentBenefits)}
              </Text>{' '}
              more in government schemes.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
