"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import React, { useEffect, useState } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { OrganizationMembershipResource } from '@clerk/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/toaster";

export default function OrgUsersPage() {
  const { organization } = useOrganization();
  const [users, setUsers] = useState<OrganizationMembershipResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      if (!organization) return;
      
      setIsLoading(true);
      try {
        const orgUsers = await organization.getMemberships();
        if (isMounted) {
          setUsers(orgUsers.data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching organization users:', error);
        setIsLoading(false);
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [organization]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Organization Users</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">There are no users in this organization.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((membership) => (
                  <TableRow key={membership.publicUserData.userId} className="hover:bg-gray-50">
                    <TableCell className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={membership.publicUserData.imageUrl} alt={membership.publicUserData.firstName || ''} />
                        <AvatarFallback>{membership.publicUserData.firstName?.[0]}{membership.publicUserData.lastName?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{membership.publicUserData.firstName} {membership.publicUserData.lastName}</span>
                    </TableCell>
                    <TableCell>{membership.publicUserData.identifier}</TableCell>
                    <TableCell>{membership.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}