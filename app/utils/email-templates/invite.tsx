import {
    Body,
    Button,
    Container,
    Column,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text,
    Tailwind,
  } from "@react-email/components";
  import * as React from "react";
  
  interface HappybaseInviteUserEmailProps {
    name?: string;
    logo?: string;
    invitedByName?: string;
    invitedByEmail?: string;
    companyName?: string;
    inviteeLogo?: string;
    inviteeEmail?: string;
    inviteLink?: string;
  }
  
  export const HappybaseInviteUserEmail = ({
    name,
    logo,
    invitedByName,
    invitedByEmail,
    companyName,
    inviteeLogo,
    inviteeEmail,
    inviteLink,
  }: HappybaseInviteUserEmailProps) => {
    const previewText = `Join ${invitedByName} on Happybase`;
  
    return (
      <Html>
        <Head />
        <Preview>{previewText}</Preview>
        <Tailwind>
          <Body className="bg-white my-auto mx-auto font-sans px-2">
            <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
              <Section className="mt-[32px]">
                <Img
                  src={`@/public/happybase.svg`}
                  width="40"
                  height="37"
                  alt="Vercel"
                  className="my-0 mx-auto"
                />
              </Section>
              <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                Join <strong>{companyName}</strong> on <strong>Vercel</strong>
              </Heading>
              <Text className="text-black text-[14px] leading-[24px]">
                Hello {inviteeEmail},
              </Text>
              <Text className="text-black text-[14px] leading-[24px]">
                <strong>{name}</strong> (
                <Link
                  href={`mailto:${invitedByEmail}`}
                  className="text-blue-600 no-underline"
                >
                  {invitedByEmail}
                </Link>
                ) has invited you to a 30-min data access consultation via Happybase
              </Text>
              <Section>
                <Row>
                  <Column align="right">
                    <Img
                      className="rounded-full"
                      src={inviteeLogo}
                      width="64"
                      height="64"
                    />
                  </Column>
                  <Column align="center">
                    <Img
                      src={`@/public/happybase.svg`}
                      width="12"
                      height="9"
                      alt="invited you to"
                    />
                  </Column>
                  <Column align="left">
                    <Img
                      className="rounded-full"
                      src={inviteeLogo}
                      width="64"
                      height="64"
                    />
                  </Column>
                </Row>
              </Section>
              <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                  className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                  href={inviteLink}
                >
                  Join the team
                </Button>
              </Section>
              <Text className="text-black text-[14px] leading-[24px]">
                or copy and paste this URL into your browser:{" "}
                <Link href={inviteLink} className="text-blue-600 no-underline">
                  {inviteLink}
                </Link>
              </Text>
              <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
              <Text className="text-[#666666] text-[12px] leading-[24px]">
                This is a private invitation for {inviteeEmail}. If you were not
                expecting this invitation, you can ignore this email. 
              </Text>
            </Container>
          </Body>
        </Tailwind>
      </Html>
    );
  };
  
  
  export default HappybaseInviteUserEmailProps;
  