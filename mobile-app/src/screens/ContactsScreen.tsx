import React, { useMemo, useState } from 'react';
import { View, FlatList, RefreshControl, Linking } from 'react-native';
import { Appbar, Button, Dialog, List, Portal, Searchbar, Text, TextInput } from 'react-native-paper';
import {
  useMyContacts,
  useIncomingInvitations,
  useAcceptInvitation,
  useDeclineInvitation,
  useCancelContact,
  useSendInvitation,
  useAddContact,
  useProfileSearch,
} from '../hooks/useContacts';

const PAGE_SIZE = 20;

import type ReactType from 'react';
const ContactsScreen: ReactType.FC = () => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);

  const { data, isLoading, refetch, isRefetching } = useMyContacts(page, PAGE_SIZE, query);
  const { data: invites, isLoading: invitesLoading, refetch: refetchInvites } = useIncomingInvitations();
  const accept = useAcceptInvitation();
  const decline = useDeclineInvitation();
  const cancel = useCancelContact();
  const sendInvitation = useSendInvitation();
  const addContact = useAddContact();
  const profileSearch = useProfileSearch(inviteEmail || inviteName);

  const list = useMemo(() => data?.data || [], [data]);

  const onRefresh = () => {
    refetch();
    refetchInvites();
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Contacts" />
        <Appbar.Action icon="account-plus" onPress={() => setAddOpen(true)} />
      </Appbar.Header>

      <Searchbar
        placeholder="Rechercher (nom ou email)"
        value={query}
        onChangeText={(t) => {
          setQuery(t);
          setPage(0);
        }}
        style={{ margin: 12 }}
      />

      {invites && invites.length > 0 && (
        <View style={{ marginHorizontal: 12 }}>
          <Text variant="titleMedium" style={{ marginBottom: 8 }}>
            Invitations reçues
          </Text>
          {invites.map((inv: any) => (
            <List.Item
              key={inv.id}
              title={inv.name || inv.email}
              description={`Invité par ${inv.inviter_name || 'Un utilisateur'} — ${new Date(inv.invited_at).toLocaleDateString()}`}
              left={(props) => <List.Icon {...props} icon="email" />}
              right={() => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Button
                    mode="contained"
                    compact
                    style={{ marginRight: 8 }}
                    loading={accept.isPending}
                    onPress={() => accept.mutate(inv.id)}
                  >
                    Accepter
                  </Button>
                  <Button
                    mode="outlined"
                    compact
                    loading={decline.isPending}
                    onPress={() => decline.mutate(inv.id)}
                  >
                    Refuser
                  </Button>
                </View>
              )}
            />
          ))}
        </View>
      )}

  <FlatList
        data={list}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <List.Item
            title={item.name || item.email}
    description={`${item.email}`}
            left={(props) => <List.Icon {...props} icon="account" />}
            right={() => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {item.phone ? (
                  <Button
                    compact
                    mode="text"
                    onPress={() => Linking.openURL(`tel:${item.phone}`)}
                  >
                    Appeler
                  </Button>
                ) : null}
                {item.email ? (
                  <Button
                    compact
                    mode="text"
                    onPress={() => Linking.openURL(`mailto:${item.email}`)}
                  >
                    Email
                  </Button>
                ) : null}
                <Button
                  compact
                  mode="text"
                  onPress={() => sendInvitation.mutate({ contactId: item.id })}
                  loading={sendInvitation.isPending}
                >
                  Renvoyer
                </Button>
                <Button
                  compact
                  mode="text"
                  onPress={() => cancel.mutate(item.id)}
                  loading={cancel.isPending}
                >
                  Supprimer
                </Button>
              </View>
            )}
          />
        )}
        refreshControl={<RefreshControl refreshing={isRefetching || invitesLoading} onRefresh={onRefresh} />}
        onEndReached={() => {
          if ((data?.data?.length || 0) < ((data?.count || 0))) setPage((p) => p + 1);
        }}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListFooterComponent={() => (
          <View style={{ padding: 12, alignItems: 'center' }}>
            {isLoading ? <Text>Chargement…</Text> : null}
          </View>
        )}
      />

      <Portal>
        <Dialog visible={addOpen} onDismiss={() => setAddOpen(false)}>
          <Dialog.Title>Nouveau contact</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Email"
              value={inviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={setInviteEmail}
              style={{ marginBottom: 12 }}
            />
            <TextInput label="Nom (optionnel)" value={inviteName} onChangeText={setInviteName} />
            {profileSearch.data && profileSearch.data.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text variant="labelSmall" style={{ marginBottom: 4 }}>Suggestions</Text>
                {profileSearch.data.map((p: any) => (
                  <List.Item
                    key={p.user_id}
                    title={p.full_name || p.email}
                    description={p.email}
                    left={(props) => <List.Icon {...props} icon="account-search" />}
                    onPress={() => {
                      setSelectedUserId(p.user_id);
                      setInviteEmail(p.email || '');
                      if (p.full_name) setInviteName(p.full_name);
                    }}
                  />)
                )}
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddOpen(false)}>Annuler</Button>
            <Button
              mode="contained"
              loading={addContact.isPending || sendInvitation.isPending}
              onPress={async () => {
                try {
                  const c = await addContact.mutateAsync({ email: inviteEmail.trim(), name: inviteName.trim() || undefined, invitedUserId: selectedUserId });
                  await sendInvitation.mutateAsync({ contactId: c.id });
                  setInviteEmail('');
                  setInviteName('');
                  setSelectedUserId(undefined);
                  setAddOpen(false);
                } catch (e) {}
              }}
            >
              Ajouter & Inviter
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};
export default ContactsScreen;
export { ContactsScreen };
 