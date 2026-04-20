import Header from '@/components/layout/Header'
import TabBar from '@/components/layout/TabBar'

export const metadata = {
  title: 'Privacy Policy — GameCast',
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black pb-tab-bar">
      <Header showBack title="Privacy Policy" />

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">

        <div>
          <p className="text-[12px] text-[#48484a] mb-6">
            Last updated: April 2026
          </p>

          <p className="text-[14px] text-[#ebebf5]/80 leading-relaxed">
            GameCast ("we", "our", "the app") is committed to your privacy. This policy explains what data we collect, how we use it, and your rights.
          </p>
        </div>

        {[
          {
            title: 'Data We Collect',
            body: `GameCast does not collect personally identifiable information. The following data is stored only on your device (localStorage):

• Preferred voice style (Classic / Hype / Analytical)
• Spoiler Shield on/off state
• Favourite sport filters

No account creation is required. No email address or phone number is collected.`,
          },
          {
            title: 'AI Commentary & Voice',
            body: `When you generate AI commentary, your request (including game data: teams, score, period) is sent to Anthropic's Claude API to generate the commentary text.

When live voice is enabled, the generated text is sent to ElevenLabs to produce audio. Neither service receives any personal information about you — only anonymised game context.

Both Anthropic and ElevenLabs have their own privacy policies. We recommend reviewing them at anthropic.com and elevenlabs.io.`,
          },
          {
            title: 'No Advertising or Tracking',
            body: `GameCast contains no advertising, no cross-site tracking, no analytics SDKs, and no third-party cookies. We do not sell or share your data with any third party for marketing purposes.`,
          },
          {
            title: 'Audio & Microphone',
            body: `GameCast plays AI-generated audio commentary. The app does not use your device's microphone at any point. No audio is recorded from you.`,
          },
          {
            title: 'Sports Data',
            body: `Live scores, team information, and game data displayed in GameCast are used solely to provide sports information to you. This data is not linked to your identity.`,
          },
          {
            title: 'Children',
            body: `GameCast is rated 4+ and is appropriate for all ages. We do not knowingly collect data from children under 13.`,
          },
          {
            title: 'Your Rights',
            body: `Because we do not collect personal data, there is nothing to access, correct, or delete. You can clear all locally stored preferences at any time by clearing your browser/app data in your device settings.`,
          },
          {
            title: 'Changes to This Policy',
            body: `We may update this privacy policy from time to time. The updated date at the top of this page indicates the most recent revision. Continued use of the app after changes constitutes acceptance of the revised policy.`,
          },
          {
            title: 'Contact',
            body: `For privacy questions, please contact us through the app's support channel. We aim to respond within 5 business days.`,
          },
        ].map(({ title, body }) => (
          <div key={title}>
            <h2 className="text-[15px] font-semibold text-white mb-2">{title}</h2>
            <p className="text-[13px] text-[#8e8e93] leading-relaxed whitespace-pre-line">{body}</p>
          </div>
        ))}
      </div>

      <TabBar />
    </div>
  )
}
