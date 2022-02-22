import React from 'react';
import NextLink from 'next/link';
import { Avatar, Button, Text, useTheme } from '@geist-ui/react';

interface Props {
  user: { name: string; avatarSrc: string | null };
}

export type HeadingProps = Props;

const Heading: React.FC<HeadingProps> = ({ user }) => {
  const theme = useTheme();
  if (user.avatarSrc === null) {
    user.avatarSrc = "/assets/images/userLogo.jpg";
  }

  return (
    <>
      <div className="heading__wrapper">
        <div className="heading">
          <Avatar alt="Your Avatar" className="heading__user-avatar" src={user.avatarSrc} />
          <div className="heading__name">
            <div className="heading__title">
              <Text h2 className="heading__user-name">
                {user.name}
              </Text>

              <div className="heading__actions">
                <NextLink href="/map" passHref>
                  <Button type="success" auto>
                    Search Recycling
                  </Button>
                </NextLink>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .heading__wrapper {
          border-bottom: 0px solid ${theme.palette.border};
        }
        .heading {
          display: flex;
          flex-direction: row;
          width: ${theme.layout.pageWidthWithMargin};
          max-width: 100%;
          margin: 0 auto;
          padding: calc(${theme.layout.gap} * 2) ${theme.layout.pageMargin} calc(${theme.layout.gap} * 4);
          box-sizing: border-box;
        }
        .heading :global(.heading__user-avatar) {
          height: 100px;
          width: 100px;
          margin-right: ${theme.layout.gap};
        }
        .heading__title {
          display: flex;
          flex-direction: row;
          align-items: center;
          flex: 1;
        }
        .heading__name {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
        }
        .heading__name :global(.heading__user-name) {
          line-height: 1;
          color: #20894d;
        }
        .heading__name :global(.heading__user-role) {
          background: ${theme.palette.accents_1};
          border-color: ${theme.palette.accents_2};
          border-radius: 1rem;
          padding: 0.175rem 0.5rem;
          height: unset;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          margin-left: ${theme.layout.gapQuarter};
        }
        .heading__actions {
          margin-left: auto;
        }
        .heading__integration :global(.heading__integration-title) {
          color: ${theme.palette.accents_5} !important;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          margin: 0;
        }
        .heading__integration-inner {
          display: flex;
          flex-direction: row;
          align-items: center;
        }
        .heading__integration-inner :global(svg) {
          margin-right: ${theme.layout.gapQuarter};
        }
      `}</style>
    </>
  );
};

export default Heading;
